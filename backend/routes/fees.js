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
// ✅ Update fee clearance by admin
router.put("/fee/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { cleared } = req.body;

    if (typeof cleared !== "boolean") {
      return res.status(400).json({ error: "cleared must be true or false" });
    }

    await pool.query(
      `UPDATE fees SET cleared = $1 WHERE student_id = $2`,
      [cleared, studentId]
    );

    res.json({ message: `Fee clearance updated for ${studentId}`, cleared });
  } catch (error) {
    console.error("❌ Error updating fee clearance:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});


export default router;
