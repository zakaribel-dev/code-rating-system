const pool = require('../db');

const authenticate = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token)
    return res.status(401).json({ message: 'Missing token' });

  try {
    const session = await pool.query(
      `SELECT users.id AS user_id, users.email 
       FROM sessions
       JOIN users ON sessions.user_id = users.id
       WHERE sessions.token = $1`,
      [token]
    );

    if (session.rows.length === 0)
      return res.status(401).json({ message: 'Invalid token' });

    req.user = session.rows[0]; 
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = authenticate;
