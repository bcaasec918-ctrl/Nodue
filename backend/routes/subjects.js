// /routes/subjects.js
import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/**
 * ✅ Fetch subjects
 * Optionally filtered by teacher_id or class_id
 */
router.get("/", async (req, res) => {
  try {
    const { teacher_id, class_id } = req.query;

    let result;

    if (teacher_id && class_id) {
      result = await pool.query(
        "SELECT * FROM subjects WHERE teacher_id = $1 AND class_id = $2",
        [teacher_id, class_id]
      );
    } else if (teacher_id) {
      result = await pool.query("SELECT * FROM subjects WHERE teacher_id = $1", [teacher_id]);
    } else if (class_id) {
      result = await pool.query("SELECT * FROM subjects WHERE class_id = $1", [class_id]);
    } else {
      result = await pool.query("SELECT * FROM subjects");
    }

    res.json(result.rows);
  } catch (err) {
    console.error("❌ SQL error fetching subjects:", err.message);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

export default router;
