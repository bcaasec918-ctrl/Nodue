import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import subjectsRoutes from "./routes/subjects.js";

import { pool } from "./db.js";

import studentsRoutes from "./routes/students.js";
import attendanceRoutes from "./routes/attendance.js";
import feesRoutes from "./routes/fees.js";
import nodueRoutes from "./routes/nodue.js";
import teachersRoutes from "./routes/teachers.js";
import classRoutes from "./routes/classes.js";
import feesRouter from "./routes/fees.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("College backend is running 🚀"));

app.use("/students", studentsRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/fees", feesRoutes);
app.use("/nodue", nodueRoutes);
app.use("/teachers", teachersRoutes);
app.use("/classes", classRoutes);
app.use("/subjects", subjectsRoutes);
app.use("/fees", feesRouter);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
