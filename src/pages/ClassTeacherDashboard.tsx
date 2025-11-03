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
import { Users, TrendingUp, Award, Search } from "lucide-react";

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

        console.log("✅ All students from DB:", studentsArray);
        console.log("👩‍🏫 Assigned class:", currentUser.assignedClass);

        const classMap: Record<string, number> = {
          "BCA 1st Year": 3,
          "BCA 2nd Year": 2,
          "BCA 3rd Year": 1,
        };

        const assignedClassId = classMap[currentUser.assignedClass] || null;

        const filtered = studentsArray.filter(
          (student) => student.class_id === assignedClassId
        );

        console.log("🎯 Filtered students:", filtered);
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
          } catch (err) {
            console.error(
              `⚠️ Error fetching data for student ${student.student_id}:`,
              err
            );
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

      console.log("📊 Student data summary:", data);
    } catch (err) {
      console.error("❌ Error calculating stats:", err);
    }
  };

  // ✅ Search + Filter + Sort logic
  useEffect(() => {
    let updated = [...classStudents];

    // 🔍 Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      updated = updated.filter(
        (student) =>
          student.student_name.toLowerCase().includes(term) ||
          student.student_id.toString().includes(term)
      );
    }

    // 🧩 Sorting by eligibility
    if (sortFilter === "eligible") {
      updated.sort((a, b) => {
        const aEligible = studentData[a.student_id]?.eligible ? -1 : 1;
        const bEligible = studentData[b.student_id]?.eligible ? -1 : 1;
        return aEligible - bEligible;
      });
    } else if (sortFilter === "notEligible") {
      updated.sort((a, b) => {
        const aEligible = studentData[a.student_id]?.eligible ? 1 : -1;
        const bEligible = studentData[b.student_id]?.eligible ? 1 : -1;
        return aEligible - bEligible;
      });
    }

    setFilteredStudents(updated);
  }, [searchTerm, classStudents, sortFilter, studentData]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Class Teacher Dashboard
          </h1>
          <p className="text-gray-600">
            Managing Class: {currentUser?.assignedClass}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalStudents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Attendance
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageAttendance}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Award className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  No Due Eligible
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.eligibleForNoDue}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students">Students Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        {/* Students Overview */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Class {currentUser?.assignedClass} Students</span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by student name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Eligibility Filter Badges */}
              <div className="flex items-center gap-3 mb-4">
                <Badge
                  onClick={() => setSortFilter("eligible")}
                  className={`cursor-pointer px-3 py-1 text-sm font-medium ${
                    sortFilter === "eligible"
                      ? "bg-green-600 text-white"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  ✅ Eligible
                </Badge>

                <Badge
                  onClick={() => setSortFilter("notEligible")}
                  className={`cursor-pointer px-3 py-1 text-sm font-medium ${
                    sortFilter === "notEligible"
                      ? "bg-red-600 text-white"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  ❌ Not Eligible
                </Badge>

                <Badge
                  onClick={() => setSortFilter("all")}
                  className={`cursor-pointer px-3 py-1 text-sm font-medium ${
                    sortFilter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  🔄 Show All
                </Badge>
              </div>

              {/* Student List */}
              {filteredStudents.length === 0 ? (
                <p className="text-gray-500">No students found.</p>
              ) : (
                <div className="grid gap-4">
                  {filteredStudents.map((student) => {
                    const data =
                      studentData[student.student_id] || {
                        attendance: 0,
                        eligible: false,
                      };

                    return (
                      <div
                        key={student.student_id}
                        className={`p-4 border rounded-lg space-y-4 transition ${
                          data.eligible
                            ? "bg-green-50 border-green-200"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {student.student_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {student.student_id} | Class ID:{" "}
                              {student.class_id}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                data.attendance >= 75
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {data.attendance}% Attendance
                            </Badge>
                            {data.eligible ? (
                              <Badge
                                variant="default"
                                className="bg-green-600"
                              >
                                No Due Eligible
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="bg-red-100 text-red-700"
                              >
                                Not Eligible
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <button
                            onClick={() =>
                              setVisibleCertificate((prev) =>
                                prev === student.student_id
                                  ? null
                                  : student.student_id
                              )
                            }
                            className="text-indigo-600 text-sm font-medium hover:underline"
                          >
                            {visibleCertificate === student.student_id
                              ? "Hide Certificate"
                              : "View No Due Certificate"}
                          </button>
                        </div>

                        {visibleCertificate === student.student_id && (
                          <div className="mt-4">
                            <NoDueCertificate
                              studentId={student.student_id}
                            />
                          </div>
                        )}
                      </div>
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
