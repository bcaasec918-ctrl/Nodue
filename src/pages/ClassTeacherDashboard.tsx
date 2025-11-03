import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import AttendanceManager from "../components/AttendanceManager";
import NoDueCertificate from "../components/NoDueCertificate";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Award, Search } from "lucide-react";
import { motion } from "framer-motion";

const ClassTeacherDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortFilter, setSortFilter] = useState<
    "all" | "eligible" | "notEligible"
  >("all");
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageAttendance: 0,
    eligibleForNoDue: 0,
  });
  const [visibleCertificate, setVisibleCertificate] = useState<string | null>(
    null
  );
  const [studentData, setStudentData] = useState<
    Record<string, { attendance: number; eligible: boolean }>
  >({});

  // ✅ Fetch class students
  useEffect(() => {
    if (!currentUser?.assignedClass) return;

    const fetchStudents = async () => {
      try {
        const allStudents = await api.getStudents();
        const studentsArray = Array.isArray(allStudents)
          ? allStudents
          : allStudents?.data || [];

        const classMap: Record<string, number> = {
          "BCA 1st Year": 3,
          "BCA 2nd Year": 2,
          "BCA 3rd Year": 1,
        };

        const assignedClassId = classMap[currentUser.assignedClass] || null;

        const filtered = studentsArray.filter(
          (student) => student.class_id === assignedClassId
        );

        setClassStudents(filtered);
        setFilteredStudents(filtered);
        fetchStudentStats(filtered);
      } catch (err) {
        console.error("❌ Error fetching students:", err);
      }
    };

    fetchStudents();
  }, [currentUser?.assignedClass]);

  // ✅ Fetch attendance & no-due stats
  const fetchStudentStats = async (students: any[]) => {
    if (students.length === 0) {
      setStats({ totalStudents: 0, averageAttendance: 0, eligibleForNoDue: 0 });
      return;
    }

    try {
      const results = await Promise.all(
        students.map(async (student) => {
          try {
            const [attendance, nodue] = await Promise.all([
              api.getAttendance(student.student_id),
              api.getNoDueStatus(student.student_id),
            ]);

            const attendanceRecord = Array.isArray(attendance)
              ? attendance[0]
              : attendance;

            const rawPercentage =
              attendanceRecord?.percentage ??
              attendanceRecord?.attendance_percentage ??
              attendanceRecord?.attendancePercent ??
              0;

            const attendancePercent = parseFloat(rawPercentage) || 0;
            const isEligible = !!nodue?.eligible;

            return {
              id: student.student_id,
              attendance: attendancePercent,
              eligible: isEligible,
            };
          } catch {
            return { id: student.student_id, attendance: 0, eligible: false };
          }
        })
      );

      const data: Record<string, { attendance: number; eligible: boolean }> = {};
      let totalAttendance = 0;
      let eligibleCount = 0;

      results.forEach(({ id, attendance, eligible }) => {
        data[id] = { attendance, eligible };
        totalAttendance += attendance;
        if (eligible) eligibleCount++;
      });

      setStudentData(data);
      setStats({
        totalStudents: students.length,
        averageAttendance:
          students.length > 0
            ? Math.round(totalAttendance / students.length)
            : 0,
        eligibleForNoDue: eligibleCount,
      });
    } catch (err) {
      console.error("❌ Error calculating stats:", err);
    }
  };

  // ✅ Search + Filter
  useEffect(() => {
    let updated = [...classStudents];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      updated = updated.filter(
        (student) =>
          student.student_name.toLowerCase().includes(term) ||
          student.student_id.toString().includes(term)
      );
    }

    if (sortFilter === "eligible") {
      updated = updated.filter((s) => studentData[s.student_id]?.eligible);
    } else if (sortFilter === "notEligible") {
      updated = updated.filter((s) => !studentData[s.student_id]?.eligible);
    }

    setFilteredStudents(updated);
  }, [searchTerm, classStudents, sortFilter, studentData]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900">
            Class Teacher Dashboard
          </h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Managing Class: <strong>{currentUser?.assignedClass}</strong>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {[
          {
            icon: Users,
            label: "Total Students",
            value: stats.totalStudents,
            color: "text-indigo-600",
          },
          {
            icon: TrendingUp,
            label: "Average Attendance",
            value: `${stats.averageAttendance}%`,
            color: "text-emerald-600",
          },
          {
            icon: Award,
            label: "No Due Eligible",
            value: stats.eligibleForNoDue,
            color: "text-purple-600",
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white hover:shadow-lg transition-shadow duration-300 rounded-2xl border border-slate-200">
              <CardContent className="p-4 sm:p-6 flex items-center gap-4">
                <item.icon className={`h-8 w-8 sm:h-10 sm:w-10 ${item.color}`} />
                <div>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {item.label}
                  </p>
                  <p className="text-2xl sm:text-3xl font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="w-full flex flex-wrap justify-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
          <TabsTrigger
            value="students"
            className="flex-1 sm:flex-none text-sm sm:text-base data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg"
          >
            Students Overview
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="flex-1 sm:flex-none text-sm sm:text-base data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg"
          >
            Attendance Manager
          </TabsTrigger>
        </TabsList>

        {/* Students Overview */}
        <TabsContent value="students" className="space-y-6">
          <Card className="shadow-sm rounded-2xl border border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800 text-lg sm:text-xl">
                <Users className="h-5 w-5 text-indigo-600" />
                Class Students
              </CardTitle>
            </CardHeader>

            <CardContent>
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search student name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Filter buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-5">
                <Button
                  onClick={() => setSortFilter("eligible")}
                  variant={sortFilter === "eligible" ? "default" : "outline"}
                  className={`flex-1 sm:flex-none ${
                    sortFilter === "eligible"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : ""
                  }`}
                >
                  ✅ Eligible
                </Button>
                <Button
                  onClick={() => setSortFilter("notEligible")}
                  variant={sortFilter === "notEligible" ? "default" : "outline"}
                  className={`flex-1 sm:flex-none ${
                    sortFilter === "notEligible"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : ""
                  }`}
                >
                  ❌ Not Eligible
                </Button>
                <Button
                  onClick={() => setSortFilter("all")}
                  variant={sortFilter === "all" ? "default" : "outline"}
                  className={`flex-1 sm:flex-none ${
                    sortFilter === "all"
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : ""
                  }`}
                >
                  🔄 Show All
                </Button>
              </div>

              {/* Student Cards */}
              {filteredStudents.length === 0 ? (
                <p className="text-slate-500 text-center py-6">
                  No students found.
                </p>
              ) : (
                <div className="grid gap-3 sm:gap-4">
                  {filteredStudents.map((student, i) => {
                    const data =
                      studentData[student.student_id] || {
                        attendance: 0,
                        eligible: false,
                      };
                    return (
                      <motion.div
                        key={student.student_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`p-4 sm:p-5 border rounded-xl transition-all shadow-sm hover:shadow-md ${
                          data.eligible
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-800 text-sm sm:text-base">
                              {student.student_name}
                            </p>
                            <p className="text-xs sm:text-sm text-slate-500">
                              ID: {student.student_id}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant={
                                data.attendance >= 75
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {data.attendance}% Attendance
                            </Badge>
                            <Badge
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                data.eligible
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {data.eligible
                                ? "No Due Eligible"
                                : "Not Eligible"}
                            </Badge>
                          </div>
                        </div>

                        <div className="text-right mt-3">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() =>
                              setVisibleCertificate((prev) =>
                                prev === student.student_id
                                  ? null
                                  : student.student_id
                              )
                            }
                            className="text-indigo-600 hover:text-indigo-700 text-sm"
                          >
                            {visibleCertificate === student.student_id
                              ? "Hide Certificate"
                              : "View No Due Certificate"}
                          </Button>
                        </div>

                        {visibleCertificate === student.student_id && (
                          <div className="mt-4">
                            <NoDueCertificate studentId={student.student_id} />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance */}
        <TabsContent value="attendance">
          <AttendanceManager userClass={currentUser?.assignedClass} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassTeacherDashboard;
