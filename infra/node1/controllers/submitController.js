const pool = require("../db");

const handleSubmit = async (req, res) => {
  try {
    const { course, exercise, language } = req.body;
    const email = req.user.email;
    
    const file = req.file;
    console.log("exercice", exercise);

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let result = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    let userId;
    if (result.rows.length === 0) {
      const insertUser = await pool.query(
        "INSERT INTO users (email) VALUES ($1) RETURNING id",
        [email]
      );
      userId = insertUser.rows[0].id;
    } else {
      userId = result.rows[0].id;
    }

    const insertSubmission = await pool.query(
      `INSERT INTO submissions 
       (user_id, course, exercise, language, filename)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, status`,
      [userId, course, exercise, language, file.filename]
    );

    return res.status(200).json({
      message: "Submission saved",
      submissionId: insertSubmission.rows[0].id,
      status: insertSubmission.rows[0].status,
    });
  } catch (err) {
    console.error("Error in handleSubmit:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { handleSubmit };
