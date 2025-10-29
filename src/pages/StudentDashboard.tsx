import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockStudents, mockSubjects, AttendanceRecord, FeesRecord } from '../utils/mockData';
import { storageUtils } from '../utils/storage';
import NoDueCertificate from '../components/NoDueCertificate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, Calendar, Award } from 'lucide-react';

interface StudentData {
  attendance: AttendanceRecord[];
  fees?: FeesRecord;
}

const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [stats, setStats] = useState({
    overallAttendance: 0,
    totalSubjects: 0,
    eligibleForNoDue: false
  });

  const student = mockStudents.find(s => s.id === currentUser?.studentId);

  useEffect(() => {
    if (student) {
      loadStudentData();
      calculateStats();
    }
  }, [student]);

  const loadStudentData = () => {
    if (!student) return;

    const attendance = storageUtils.getAttendance().filter(a => a.studentId === student.id);
    const fees = storageUtils.getFees().find(f => f.studentId === student.id);

    setStudentData({ attendance, fees });
  };

  const calculateStats = () => {
    if (!student) return;

    const overallAttendance = storageUtils.calculateAttendancePercentage(student.id);
    const eligibleForNoDue = storageUtils.isEligibleForNoDue(student.id);

    setStats({
      overallAttendance,
      totalSubjects: mockSubjects.length,
      eligibleForNoDue
    });
  };

  const getSubjectAttendance = (subject: string): number => {
    if (!student) return 0;
    return storageUtils.calculateAttendancePercentage(student.id, subject);
  };

  if (!student) {
    return <div>Student not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">Welcome, {student.name}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Roll Number</p>
                <p className="text-xl font-bold text-gray-900">{student.rollNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Attendance</p>
                <p className="text-xl font-bold text-gray-900">{stats.overallAttendance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Award className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">No Due Status</p>
                <p className={`text-xl font-bold ${stats.eligibleForNoDue ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.eligibleForNoDue ? 'Eligible' : 'Not Eligible'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="certificate">No Due Certificate</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Roll Number:</span>
                  <span className="font-medium">{student.rollNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Class:</span>
                  <span className="font-medium">{student.class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{student.email}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Overall Attendance</span>
                    <span className="text-sm font-medium">{stats.overallAttendance}%</span>
                  </div>
                  <Progress value={stats.overallAttendance} className="h-2" />
                </div>
                <div className="pt-2">
                  <Badge
                    variant={stats.eligibleForNoDue ? "default" : "destructive"}
                    className="w-full justify-center"
                  >
                    {stats.eligibleForNoDue
                      ? 'Eligible for No Due Certificate'
                      : 'Not Eligible for No Due Certificate'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Attendance by Subject</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {mockSubjects.map(subject => {
                  const attendance = getSubjectAttendance(subject.name);
                  return (
                    <div key={subject.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">{subject.name}</div>
                          <div className="text-sm text-gray-500">{subject.code}</div>
                        </div>
                        <Badge variant={attendance >= 75 ? "default" : "destructive"}>
                          {attendance}%
                        </Badge>
                      </div>
                      <Progress value={attendance} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificate">
          <NoDueCertificate studentId={student.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;
