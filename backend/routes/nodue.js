import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/**
 * ✅ PUT /api/nodue/fee/:studentId
 * Update or insert fee clearance status with class_id
 */
router.put("/fee/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { cleared, class_id } = req.body;

    if (typeof cleared !== "boolean") {
      return res.status(400).json({ error: "cleared must be a boolean" });
    }
    if (!class_id) {
      return res.status(400).json({ error: "class_id is required" });
    }

    // ✅ Ensure table exists with UNIQUE student_id
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fees (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(20) NOT NULL UNIQUE,
        class_id INT NOT NULL,
        cleared BOOLEAN DEFAULT FALSE
      )
    `);

    // ✅ Upsert record
    await pool.query(
      `
      INSERT INTO fees (student_id, class_id, cleared)
      VALUES ($1, $2, $3)
      ON CONFLICT (student_id)
      DO UPDATE SET 
        cleared = EXCLUDED.cleared,
        class_id = EXCLUDED.class_id
      `,
      [studentId, class_id, cleared]
    );

    console.log(`💰 Fee status for ${studentId} set to ${cleared} (Class ${class_id})`);
    res.json({
      message: "Fee status updated successfully",
      studentId,
      class_id,
      cleared,
    });
  } catch (error) {
    console.error("❌ Error updating fee status:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

/**
 * ✅ GET /api/nodue/fee/:studentId
 * Fetch a student's current fee clearance status
 */
router.get("/fee/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const result = await pool.query(
      `SELECT student_id, class_id, cleared FROM fees WHERE student_id = $1`,
      [studentId]
    );

    if (result.rows.length === 0) {
      return res.json({
        student_id: studentId,
        cleared: false,
        class_id: null,
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching fee status:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

/**
 * ✅ GET /api/nodue/:studentId
 * Fetch eligibility details (attendance + fee status)
 */
router.get("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log("📘 Checking No Due for student:", studentId);

    // ✅ Fetch attendance per subject
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

    // ✅ Fetch fee clearance
    const fees = await pool.query(
      `SELECT cleared FROM fees WHERE student_id = $1`,
      [studentId]
    );

    const cleared = fees.rows[0]?.cleared ?? false;

    // ✅ Calculate totals and eligibility
    const totalClasses = attendance.rows.reduce(
      (sum, row) => sum + Number(row.total_classes || 0),
      0
    );
    const attendedClasses = attendance.rows.reduce(
      (sum, row) => sum + Number(row.attended_classes || 0),
      0
    );

    const overallPercentage =
      totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

    const eligible = overallPercentage >= 75 && cleared;

    // ✅ Fetch approval statuses
    const approvals = await pool.query(
      `SELECT role, approved_at FROM approvals WHERE student_id = $1`,
      [studentId]
    );

    const approvalMap = {
      class_teacher: false,
      hod: false,
      principal: false,
    };

    approvals.rows.forEach((row) => {
      approvalMap[row.role] = true;
    });

    res.json({
      eligible,
      attendancePercentage: overallPercentage,
      feesCleared: cleared,
      subjects: attendance.rows,
      approvals: approvalMap,
    });
  } catch (error) {
    console.error("❌ Error in nodue route:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

/**
 * ✅ POST /api/nodue/approve
 * Record approval from class teacher / HOD / principal
 */
router.post("/approve", async (req, res) => {
  try {
    const { studentId, role } = req.body;

    if (!studentId || !role)
      return res.status(400).json({ error: "studentId and role required" });

    // ✅ Ensure table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS approvals (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(20) NOT NULL,
        role VARCHAR(20) NOT NULL,
        approved_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (student_id, role)
      )
    `);

    // ✅ Insert or update approval
    await pool.query(
      `INSERT INTO approvals (student_id, role, approved_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (student_id, role)
       DO UPDATE SET approved_at = EXCLUDED.approved_at`,
      [studentId, role]
    );

    console.log(`✅ ${role} approved student ${studentId}`);
    res.json({ message: `${role} approval recorded successfully` });
  } catch (error) {
    console.error("❌ Error in approve route:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

/**
 * ✅ GET /api/nodue/pending/principal
 * Fetch students approved by HOD but pending principal approval
 */
router.get("/pending/principal", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT s.student_id, s.student_name, c.class_name
       FROM students s
       JOIN classes c ON s.class_id = c.class_id
       JOIN approvals a_hod ON a_hod.student_id = s.student_id AND a_hod.role = 'hod'
       WHERE s.student_id NOT IN (
         SELECT student_id FROM approvals WHERE role = 'principal'
       )
       ORDER BY s.student_id ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching pending principal approvals:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

export default router;
