// /routes/fees.js
import express from "express";
import { pool } from "../db.js";
const router = express.Router();

router.get("/:student_id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT cleared FROM fees WHERE student_id = $1",
      [req.params.student_id]
    );

    if (result.rows.length === 0) return res.json({ cleared: false });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ SQL error fetching fees:", err.message);
    res.status(500).json({ error: "Failed to fetch fees" });
  }
});

export default router;
