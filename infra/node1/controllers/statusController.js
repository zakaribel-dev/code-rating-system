const pool = require('../db');

const getStatus = async (req, res) => {
  const { exercise } = req.query;
  const email = req.user.email;
  
  if (!email || !exercise) {
    return res.status(400).json({ message: 'Missing email or exercise' });
  }

  try {
    const result = await pool.query(
      `SELECT s.status, s.score
       FROM submissions s
       JOIN users u ON u.id = s.user_id
       WHERE u.email = $1 AND s.exercise = $2
       ORDER BY s.submitted_at DESC
       LIMIT 1`,
      [email, exercise]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No submission found' });
    }

    return res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error('Error in getStatus:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getStatus };
