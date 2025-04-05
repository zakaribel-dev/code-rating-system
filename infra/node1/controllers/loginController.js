const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

const loginUser = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    
    let result = await pool.query('SELECT id, role FROM users WHERE email = $1', [email]);

    let user;
    if (result.rows.length === 0) {
      const insertUser = await pool.query(
        'INSERT INTO users (email) VALUES ($1) RETURNING id, role',
        [email]
      );
      user = insertUser.rows[0];
    } else {
      user = result.rows[0];
    }

    
    const token = uuidv4();

    
    await pool.query(
      'INSERT INTO sessions (user_id, token) VALUES ($1, $2)',
      [user.id, token]
    );

    
    res.status(200).json({ token, email, role: user.role });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { loginUser };
