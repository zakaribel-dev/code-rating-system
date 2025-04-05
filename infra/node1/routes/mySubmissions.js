const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticate = require('../middlewares/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const { rows } = await pool.query(
      `SELECT course, exercise, language, status, score, submitted_at 
       FROM submissions
       WHERE user_id = $1
       ORDER BY submitted_at DESC`,
      [userId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
