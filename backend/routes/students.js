import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/**
 * ✅ Fetch students, filtered by class name or ID
 */
router.get("/", async (req, res) => {
  try {
    const classParam = req.query.class;

    let result;
    if (classParam) {
      // Check if it's a number (class_id) or a name (class_name)
      if (!isNaN(classParam)) {
        result = await pool.query("SELECT * FROM students WHERE class_id = $1", [classParam]);
      } else {
        result = await pool.query(
          `SELECT s.* 
           FROM students s 
           JOIN classes c ON s.class_id = c.class_id 
           WHERE c.class_name = $1`,
          [classParam]
        );
      }
    } else {
      result = await pool.query("SELECT * FROM students");
    }

    if (result.rows.length === 0) {
      return res.status(200).json([]);
    }

    res.json(result.rows);
  } catch (err) {
    console.error("❌ SQL error fetching students:", err.message);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

/**
 * ✅ Get specific student by ID (used in NoDueCertificate)
 */
router.get("/:student_id", async (req, res) => {
  const { student_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
         s.student_id,
         s.student_name,
         s.class_id,
         c.class_name
       FROM students s
       LEFT JOIN classes c ON s.class_id = c.class_id
       WHERE s.student_id = $1`,
      [student_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ SQL error fetching student:", err.message);
    res.status(500).json({ error: "Failed to fetch student details" });
  }
});

export default router;
