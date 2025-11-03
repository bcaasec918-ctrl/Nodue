import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  Award,
  BookOpen,
  UserCog,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageAttendance: 0,
    eligibleForNoDue: 0,
  });

  const [studentData, setStudentData] = useState<
    Record<
      string,
      { attendance: number; eligible: boolean; feesCleared: boolean }
    >
  >({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allStudents, allTeachers, allClasses] = await Promise.all([
          api.getStudents(),
          api.getTeachers(),
          api.getClasses(),
        ]);

        setStudents(allStudents);
        setTeachers(allTeachers);
        setClasses(allClasses);
        fetchStudentStats(allStudents);
      } catch (err) {
        console.error("❌ Error fetching admin data:", err);
      }
    };

    fetchData();
  }, []);

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

            const attendancePercent = attendance?.percentage || 0;
            const isEligible = !!nodue?.eligible;
            const feesCleared = !!nodue?.feesCleared;

            return {
              id: student.student_id,
              attendance: attendancePercent,
              eligible: isEligible,
              feesCleared,
            };
          } catch {
            return {
              id: student.student_id,
              attendance: 0,
              eligible: false,
              feesCleared: false,
            };
          }
        })
      );

      const data: Record<
        string,
        { attendance: number; eligible: boolean; feesCleared: boolean }
      > = {};
      let totalAttendance = 0;
      let eligibleCount = 0;

      results.forEach(({ id, attendance, eligible, feesCleared }) => {
        data[id] = { attendance, eligible, feesCleared };
        totalAttendance += attendance;
        if (eligible) eligibleCount++;
      });

      setStudentData(data);
      setStats({
        totalStudents: students.length,
        averageAttendance: Math.round(totalAttendance / students.length),
        eligibleForNoDue: eligibleCount,
      });
    } catch (err) {
      console.error("❌ Error calculating stats:", err);
    }
  };

  /** ✅ Admin toggle to mark/unmark fee clearance (includes class_id) */
  const toggleFeeClearance = async (
    studentId: string,
    currentStatus: boolean,
    classId: number
  ) => {
    try {
      const newStatus = !currentStatus;
      await api.updateFeeStatus(studentId, classId, newStatus);
      toast.success(
        `Fee status for ${studentId} marked as ${
          newStatus ? "Cleared ✅" : "Not Cleared ❌"
        }`
      );

      setStudentData((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], feesCleared: newStatus },
      }));
    } catch (err) {
      console.error("❌ Error updating fee status:", err);
      toast.error("Failed to update fee status.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome, {currentUser?.name}</p>
        </div>
      </div>

      {/* 📊 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalStudents}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Average Attendance</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageAttendance}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-3">
            <Award className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">No Due Eligible</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.eligibleForNoDue}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🧭 Tabs Section */}
      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        {/* 👨‍🎓 Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>All Students</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4">
              {students.map((student) => {
                const data = studentData[student.student_id] || {
                  attendance: 0,
                  eligible: false,
                  feesCleared: false,
                };

                return (
                  <div
                    key={student.student_id}
                    className={`p-4 border rounded-lg space-y-2 transition ${
                      data.eligible
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          {student.student_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {student.student_id} | Class: {student.class_name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            data.attendance >= 75 ? "default" : "destructive"
                          }
                        >
                          {data.attendance}% Attendance
                        </Badge>
                        {data.eligible && (
                          <Badge variant="default" className="bg-green-600">
                            No Due Eligible
                          </Badge>
                        )}
                        <Badge
                          className={`${
                            data.feesCleared
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {data.feesCleared ? "Fees Cleared" : "Pending Fees"}
                        </Badge>
                      </div>
                    </div>

                    {/* ✅ Toggle Fee Clearance */}
                    <div className="text-right mt-3">
                      <Button
                        variant={data.feesCleared ? "destructive" : "default"}
                        size="sm"
                        onClick={() =>
                          toggleFeeClearance(
                            student.student_id,
                            data.feesCleared,
                            student.class_id // ✅ Added class_id
                          )
                        }
                      >
                        {data.feesCleared ? (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Unmark Fees Cleared
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Fees Cleared
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🏫 Classes Tab */}
        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Class Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {classes.map((cls) => {
                const studentCount = students.filter(
                  (s) => s.class_id === cls.class_id
                ).length;
                return (
                  <div
                    key={cls.class_id}
                    className="p-4 border rounded-lg flex justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {cls.class_name}
                      </p>
                      <p className="text-sm text-gray-500">ID: {cls.class_id}</p>
                    </div>
                    <Badge variant="default">{studentCount} Students</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 👩‍🏫 Teachers Tab */}
        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCog className="h-5 w-5" />
                <span>Teacher Assignments</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {teachers.map((teacher) => (
                <div
                  key={teacher.teacher_id}
                  className="p-4 border rounded-lg flex justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{teacher.name}</p>
                    <p className="text-sm text-gray-500">
                      Assigned Class: {teacher.assignedClass || "—"}
                    </p>
                  </div>
                  <Badge variant="secondary">ID: {teacher.teacher_id}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
