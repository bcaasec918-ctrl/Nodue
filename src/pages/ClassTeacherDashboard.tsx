import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import AttendanceManager from '../components/AttendanceManager';
import NoDueCertificate from '../components/NoDueCertificate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Award } from 'lucide-react';

const ClassTeacherDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageAttendance: 0,
    eligibleForNoDue: 0,
  });
  const [visibleCertificate, setVisibleCertificate] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<
    Record<string, { attendance: number; eligible: boolean }>
  >({});

  useEffect(() => {
    if (!currentUser?.assignedClass) return;

    const fetchStudents = async () => {
      try {
        const allStudents = await api.getStudents();
        const studentsArray = Array.isArray(allStudents)
          ? allStudents
          : allStudents.data || [];

        console.log('✅ All students from DB:', studentsArray);
        console.log('👩‍🏫 Assigned class:', currentUser.assignedClass);

        // ✅ Map class names to IDs manually (you can replace this with a DB query if needed)
        const classMap: Record<string, number> = {
          'BCA 1st Year': 3,
          'BCA 2nd Year': 2,
          'BCA 3rd Year': 1,
        };

        const assignedClassId = classMap[currentUser.assignedClass] || null;

        // ✅ Filter by class_id now
        const filtered = studentsArray.filter(
          (student) => student.class_id === assignedClassId
        );

        console.log('🎯 Filtered students:', filtered);
        setClassStudents(filtered);
        fetchStudentStats(filtered);
      } catch (err) {
        console.error('❌ Error fetching students:', err);
      }
    };

    fetchStudents();
  }, [currentUser?.assignedClass]);

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

            return {
              id: student.student_id,
              attendance: attendancePercent,
              eligible: isEligible,
            };
          } catch (err) {
            console.error(`⚠️ Error fetching data for student ${student.student_id}:`, err);
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
          students.length > 0 ? Math.round(totalAttendance / students.length) : 0,
        eligibleForNoDue: eligibleCount,
      });

      console.log('📊 Student data summary:', data);
    } catch (err) {
      console.error('❌ Error calculating stats:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Teacher Dashboard</h1>
          <p className="text-gray-600">Managing Class: {currentUser?.assignedClass}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Average Attendance</p>
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
                <p className="text-sm font-medium text-gray-600">No Due Eligible</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.eligibleForNoDue}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students">Students Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Class {currentUser?.assignedClass} Students</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {classStudents.length === 0 ? (
                <p className="text-gray-500">No students found for this class.</p>
              ) : (
                <div className="grid gap-4">
                  {classStudents.map((student) => {
                    const data =
                      studentData[student.student_id] || { attendance: 0, eligible: false };

                    return (
                      <div
                        key={student.student_id}
                        className={`p-4 border rounded-lg space-y-4 transition ${
                          data.eligible
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {student.student_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {student.student_id} | Class ID: {student.class_id}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                data.attendance >= 75 ? 'default' : 'destructive'
                              }
                            >
                              {data.attendance}% Attendance
                            </Badge>
                            {data.eligible && (
                              <Badge variant="default" className="bg-green-600">
                                No Due Eligible
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <button
                            onClick={() =>
                              setVisibleCertificate((prev) =>
                                prev === student.student_id ? null : student.student_id
                              )
                            }
                            className="text-indigo-600 text-sm font-medium hover:underline"
                          >
                            {visibleCertificate === student.student_id
                              ? 'Hide Certificate'
                              : 'View No Due Certificate'}
                          </button>
                        </div>

                        {visibleCertificate === student.student_id && (
                          <div className="mt-4">
                            <NoDueCertificate studentId={student.student_id} />
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

        <TabsContent value="attendance">
          <AttendanceManager userClass={currentUser?.assignedClass} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassTeacherDashboard;
