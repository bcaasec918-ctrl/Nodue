import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/**
 * ✅ Get attendance records filtered by class and subject, including student names
 */
router.get("/", async (req, res) => {
  try {
    const { class: classParam, subject: subjectParam } = req.query;

    if (!classParam || !subjectParam) {
      return res.status(400).json({ error: "Missing class or subject" });
    }

    // Convert class name to class_id if necessary
    let classId = classParam;
    if (isNaN(classParam)) {
      const classResult = await pool.query(
        "SELECT class_id FROM classes WHERE class_name = $1",
        [classParam]
      );
      if (classResult.rows.length === 0)
        return res.status(404).json({ message: "Class not found" });
      classId = classResult.rows[0].class_id;
    }

    // Convert subject name to subject_id if necessary
    let subjectId = subjectParam;
    if (isNaN(subjectParam)) {
      const subjectResult = await pool.query(
        "SELECT subject_id FROM subjects WHERE subject_name = $1",
        [subjectParam]
      );
      if (subjectResult.rows.length === 0)
        return res.status(404).json({ message: "Subject not found" });
      subjectId = subjectResult.rows[0].subject_id;
    }

    // ✅ Fetch attendance with student names
    const result = await pool.query(
      `SELECT 
         a.student_id, 
         s.student_name, 
         a.total_classes, 
         a.attended_classes
       FROM attendance a
       JOIN students s ON a.student_id = s.student_id
       WHERE a.class_id = $1 AND a.subject_id = $2
       ORDER BY s.student_name`,
      [classId, subjectId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ SQL error fetching attendance:", err.message);
    res.status(500).json({ error: "Failed to fetch attendance records" });
  }
});

/**
 * ✅ Add or update attendance record
 */
router.post("/", async (req, res) => {
  try {
    let { student_id, subject_id, class_id, total_classes, attended_classes } = req.body;

    console.log("📦 Received payload:", req.body);

    if (!student_id) {
      return res.status(400).json({ error: "Missing student_id" });
    }

    // 🔹 Convert class name to class_id if needed
    if (class_id && isNaN(class_id)) {
      const classResult = await pool.query(
        "SELECT class_id FROM classes WHERE class_name = $1",
        [class_id]
      );
      if (classResult.rows.length === 0)
        return res.status(400).json({ error: "Invalid class name" });
      class_id = classResult.rows[0].class_id;
    } else {
      class_id = parseInt(class_id);
    }

    // 🔹 Convert subject name to subject_id if needed
    if (subject_id && isNaN(subject_id)) {
      const subjectResult = await pool.query(
        "SELECT subject_id FROM subjects WHERE subject_name = $1",
        [subject_id]
      );
      if (subjectResult.rows.length === 0)
        return res.status(400).json({ error: "Invalid subject name" });
      subject_id = subjectResult.rows[0].subject_id;
    } else {
      subject_id = parseInt(subject_id);
    }

    // 🧩 Validate IDs
    if (!class_id || isNaN(class_id)) {
      return res.status(400).json({ error: "Invalid or missing class_id" });
    }
    if (!subject_id || isNaN(subject_id)) {
      return res.status(400).json({ error: "Invalid or missing subject_id" });
    }

    // 🧩 Ensure total_classes and attended_classes are numbers
    total_classes = parseInt(total_classes) || 0;
    attended_classes = parseInt(attended_classes) || 0;

    await pool.query(
      `INSERT INTO attendance (student_id, subject_id, class_id, total_classes, attended_classes)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (student_id, subject_id, class_id)
       DO UPDATE 
       SET total_classes = EXCLUDED.total_classes,
           attended_classes = EXCLUDED.attended_classes`,
      [student_id, subject_id, class_id, total_classes, attended_classes]
    );

    res.json({ message: "✅ Attendance record saved successfully" });
  } catch (err) {
    console.error("❌ SQL error saving attendance:", err.message);
    res.status(500).json({ error: "Failed to save attendance record" });
  }
});


/**
 * ✅ Get attendance summary for a specific student
 */
router.get("/:student_id", async (req, res) => {
  const { student_id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        s.student_id,
        s.student_name,
        sub.subject_name,
        a.attended_classes,
        a.total_classes,
        ROUND(
          CASE 
            WHEN a.total_classes > 0 
            THEN (a.attended_classes::decimal / a.total_classes) * 100 
            ELSE 0 
          END, 2
        ) AS percentage
      FROM students s
      LEFT JOIN attendance a ON s.student_id = a.student_id
      LEFT JOIN subjects sub ON a.subject_id = sub.subject_id
      WHERE s.student_id = $1;
      `,
      [student_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No attendance records found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("❌ SQL error fetching student attendance:", err.message);
    res.status(500).json({ error: "Database error while fetching attendance" });
  }
});
router.post("/approve", async (req, res) => {
  const { class_id, subject_id, role } = req.body;

  if (!class_id || !subject_id || !role)
    return res.status(400).json({ error: "Missing required fields" });

  let fieldToUpdate;
  switch (role.toLowerCase()) {
    case "class_teacher":
      fieldToUpdate = "class_teacher_sign";
      break;
    case "hod":
      fieldToUpdate = "hod_sign";
      break;
    case "principal":
      fieldToUpdate = "principal_sign";
      break;
    default:
      return res.status(400).json({ error: "Invalid role" });
  }

  try {
    await pool.query(
      `UPDATE attendance 
       SET ${fieldToUpdate} = true 
       WHERE class_id = $1 AND subject_id = $2`,
      [class_id, subject_id]
    );
    res.json({ message: `${role} approval recorded successfully.` });
  } catch (err) {
    console.error("❌ SQL error approving attendance:", err.message);
    res.status(500).json({ error: "Database error during approval" });
  }
});

export default router;
