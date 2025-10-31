import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, BookOpen, GraduationCap, ShieldCheck, UserCog } from "lucide-react";

const RoleSelector = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/classes")
      .then((res) => res.json())
      .then(setClasses)
      .catch((err) => console.error("❌ Error fetching classes:", err));

    fetch("http://localhost:3001/subjects")
      .then((res) => res.json())
      .then(setSubjects)
      .catch((err) => console.error("❌ Error fetching subjects:", err));

    fetch("http://localhost:3001/students")
      .then((res) => res.json())
      .then(setStudents)
      .catch((err) => console.error("❌ Error fetching students:", err));
  }, []);

  const handleLogin = () => {
    let user;

    switch (selectedRole) {
      case "class_teacher":
        user = {
          id: `CT_${selectedClass}`,
          name: username || `Prof. ${selectedClass} Teacher`,
          role: "class_teacher",
          assignedClass: selectedClass,
        };
        navigate("/class-teacher");
        break;

      case "subject_teacher":
        user = {
          id: `ST_${selectedSubject}`,
          name: username || `Dr. ${selectedSubject} Teacher`,
          role: "subject_teacher",
          assignedSubject: selectedSubject,
        };
        navigate("/subject-teacher");
        break;

      case "hod":
        user = {
          id: "HOD_01",
          name: username || "Head of Department",
          role: "hod",
        };
        navigate("/hod");
        break;

      case "principal":
        user = {
          id: "PRINCIPAL_01",
          name: username || "Principal",
          role: "principal",
        };
        navigate("/principal");
        break;

      case "student":
        const student = students.find((s) => s.student_id === selectedStudent);
        user = {
          id: student?.student_id,
          name: username || student?.student_name || "Student",
          role: "student",
          studentId: student?.student_id,
          classId: student?.class_id,
          className: student?.class_name,
        };
        navigate("/student");
        break;

      default:
        alert("⚠️ Please select a valid role");
        return;
    }

    login(user);
  };

  const isFormValid = () => {
    if (!selectedRole || !username || !password) return false;
    if (selectedRole === "class_teacher" && !selectedClass) return false;
    if (selectedRole === "subject_teacher" && !selectedSubject) return false;
    if (selectedRole === "student" && !selectedStudent) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-50 via-blue-50 to-white flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-2xl border-none rounded-2xl bg-white/95 backdrop-blur-md">
        <CardHeader className="text-center px-6 pt-6">
          <CardTitle className="text-3xl font-extrabold text-indigo-800">
            College Management Login
          </CardTitle>
          <CardDescription className="text-indigo-600 mt-2">
            Enter your credentials and select your role
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-indigo-700">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-indigo-700">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-indigo-700">Select Role</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="class_teacher">Class Teacher</SelectItem>
                <SelectItem value="subject_teacher">Subject Teacher</SelectItem>
                <SelectItem value="hod">Head of Department</SelectItem>
                <SelectItem value="principal">Principal</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedRole === "class_teacher" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-indigo-700">Select Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.class_id} value={cls.class_name}>
                      {cls.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedRole === "subject_teacher" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-indigo-700">Select Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.subject_id} value={subject.subject_name}>
                      {subject.subject_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedRole === "student" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-indigo-700">Select Student</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your profile" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.student_id} value={student.student_id}>
                      {student.student_name} — {student.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={!isFormValid()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition-colors duration-200"
          >
            Login to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSelector;
