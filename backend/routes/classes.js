// /routes/classes.js
import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/**
 * ✅ Fetch all classes
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM classes ORDER BY class_id");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching classes:", err.message);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

export default router;
