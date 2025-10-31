import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log("📘 Checking No Due for student:", studentId);

    const attendance = await pool.query(
      `SELECT 
         s.subject_name,
         a.attended_classes,
         a.total_classes,
         ROUND((a.attended_classes::decimal / NULLIF(a.total_classes, 0)) * 100, 2) AS percentage
       FROM attendance a
       JOIN subjects s ON a.subject_id = s.subject_id
       WHERE a.student_id = $1`,
      [studentId]
    );

    console.log("✅ Attendance rows:", attendance.rows);

    const fees = await pool.query(
      `SELECT cleared FROM fees WHERE student_id = $1`,
      [studentId]
    );
    console.log("💰 Fee record:", fees.rows);

    const cleared = fees.rows[0]?.cleared ?? false;

    const totalClasses = attendance.rows.reduce(
      (sum, row) => sum + Number(row.total_classes),
      0
    );
    const attendedClasses = attendance.rows.reduce(
      (sum, row) => sum + Number(row.attended_classes),
      0
    );

    const overallPercentage =
      totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

    const eligible = overallPercentage >= 75 && cleared;

    res.json({
      eligible,
      attendancePercentage: overallPercentage,
      feesCleared: cleared,
      subjects: attendance.rows,
    });
  } catch (error) {
    console.error("❌ Error in nodue route:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

export default router;
