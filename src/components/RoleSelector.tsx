import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Shield,
  Users,
  BookOpen,
  GraduationCap,
  UserCog,
  School,
  User,
  Lock,
  LogIn,
} from "lucide-react";

const RoleSelector = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // ✅ States
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch data once
  useEffect(() => {
    Promise.all([
      fetch("https://nodue-backend-kvy1.onrender.com/classes").then((res) => res.json()),
      fetch("https://nodue-backend-kvy1.onrender.com/subjects").then((res) => res.json()),
      fetch("https://nodue-backend-kvy1.onrender.com/students").then((res) => res.json()),
    ])
      .then(([cls, subj, std]) => {
        setClasses(cls);
        setSubjects(subj);
        setStudents(std);
      })
      .catch((err) => console.error("❌ Error fetching data:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    let user;

    switch (selectedRole) {
      case "admin":
        user = { id: "ADMIN_01", name: username || "Admin", role: "admin" };
        break;
      case "class_teacher":
        user = {
          id: `CT_${selectedClass}`,
          name: username || `Prof. ${selectedClass} Teacher`,
          role: "class_teacher",
          assignedClass: selectedClass,
        };
        break;
      case "subject_teacher":
        user = {
          id: `ST_${selectedSubject}`,
          name: username || `Dr. ${selectedSubject} Teacher`,
          role: "subject_teacher",
          assignedSubject: selectedSubject,
        };
        break;
      case "hod":
        user = { id: "HOD_01", name: username || "Head of Department", role: "hod" };
        break;
      case "principal":
        user = { id: "PRINCIPAL_01", name: username || "Principal", role: "principal" };
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
        break;
      default:
        toast.error("⚠️ Please select a valid role.");
        return;
    }

    login(user);
    toast.success(`Welcome ${user.name}!`);
    navigate("/dashboard");
  };

  const isFormValid = () => {
    if (!selectedRole || !username || !password) return false;
    if (selectedRole === "class_teacher" && !selectedClass) return false;
    if (selectedRole === "subject_teacher" && !selectedSubject) return false;
    if (selectedRole === "student" && !selectedStudent) return false;
    return true;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && isFormValid()) handleLogin();
  };

  const roles = [
    { value: "admin", label: "Admin", icon: Shield },
    { value: "class_teacher", label: "Class Teacher", icon: Users },
    { value: "subject_teacher", label: "Subject Teacher", icon: BookOpen },
    { value: "hod", label: "Head of Department", icon: UserCog },
    { value: "principal", label: "Principal", icon: School },
    { value: "student", label: "Student", icon: GraduationCap },
  ];

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-50 via-blue-50 to-white p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80 }}
      >
        <Card className="w-full max-w-lg shadow-2xl border-none rounded-2xl bg-white/95 backdrop-blur-md">
          <CardHeader className="text-center px-6 pt-6">
            <CardTitle className="text-3xl font-extrabold text-indigo-800">
              No Due Login
            </CardTitle>
            <CardDescription className="text-indigo-600 mt-2">
              Enter your credentials and select your role
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-6 pb-6" onKeyDown={handleKeyPress}>
            {/* Username */}
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-4 w-4 text-indigo-500" />
              <Input
                type="text"
                className="pl-9"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-indigo-500" />
              <Input
                type="password"
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-indigo-700">
                Select Role
              </label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {roles.map(({ value, label, icon: Icon }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-indigo-600" />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Dropdowns */}
            {selectedRole === "class_teacher" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="text-sm font-semibold text-indigo-700">
                  Select Class
                </label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your class" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {classes.map((cls) => (
                      <SelectItem key={cls.class_id} value={cls.class_name}>
                        {cls.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}

            {selectedRole === "subject_teacher" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="text-sm font-semibold text-indigo-700">
                  Select Subject
                </label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {subjects.map((subject) => (
                      <SelectItem key={subject.subject_id} value={subject.subject_name}>
                        {subject.subject_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}

            {selectedRole === "student" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="text-sm font-semibold text-indigo-700">
                  Select Student
                </label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your profile" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {students.map((student) => (
                      <SelectItem key={student.student_id} value={student.student_id}>
                        {student.student_name} — {student.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={!isFormValid() || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition-transform active:scale-95"
            >
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? "Loading..." : "Login to Dashboard"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default RoleSelector;
