import express from 'express';
import { pool } from '../db.js';
const router = express.Router();

// GET /teachers → fetch all teachers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teachers');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching teachers');
  }
});

export default router;
