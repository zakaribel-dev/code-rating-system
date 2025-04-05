const pool = require('../db');


exports.createExercise = async (req, res) => {
  try {
    const { title, description, language, input, expected_output, course } = req.body;

    if (!title || !language || !expected_output) {
      return res.status(400).json({ message: "Champs requis manquants." });
    }

    const result = await pool.query(
      `INSERT INTO exercises (title, description, language, input, expected_output, course)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [title, description || '', language, input || '', expected_output.trim(), course || '']
    );

    res.status(201).json({
      message: "Exercice ajouté avec succès",
      exercise_id: result.rows[0].id
    });
  } catch (err) {
    console.error("Erreur ajout exercice:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


exports.getGroupedExercises = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, language, course,description
       FROM exercises
       ORDER BY course, id`
    );

    const grouped = {};

    rows.forEach((row) => {
      if (!grouped[row.course]) {
        grouped[row.course] = [];
      }
      grouped[row.course].push({
        id: row.id,
        title: row.title,
        language: row.language,
        description: row.description,
      });
    });

    const result = Object.entries(grouped).map(([course, exercises]) => ({
      course,
      exercises,
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("Erreur regroupement exercices:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


exports.getExercisesWithSubmissions = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        e.id AS exercise_id,
        e.title,
        e.course,
        e.language,
        u.email AS user_email,
        s.score,
        s.status,
        s.submitted_at
      FROM exercises e
      LEFT JOIN submissions s ON e.id::text = s.exercise
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY e.id, s.submitted_at
    `);

    const grouped = {};

    for (const row of rows) {
      if (!grouped[row.exercise_id]) {
        grouped[row.exercise_id] = {
          id: row.exercise_id,
          title: row.title,
          course: row.course,
          language: row.language,
          submissions: [],
        };
      }

      if (row.user_email) {
        grouped[row.exercise_id].submissions.push({
          user_email: row.user_email,
          score: row.score,
          status: row.status,
          submitted_at: row.submitted_at,
        });
      }
    }

    res.json(Object.values(grouped));
  } catch (err) {
    console.error("Erreur getExercisesWithSubmissions:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
