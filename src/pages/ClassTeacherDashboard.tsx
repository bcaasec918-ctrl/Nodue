import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockStudents } from '../utils/mockData';
import { storageUtils } from '../utils/storage';
import AttendanceManager from '../components/AttendanceManager';
import NoDueCertificate from '../components/NoDueCertificate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Award } from 'lucide-react';

const ClassTeacherDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageAttendance: 0,
    eligibleForNoDue: 0
  });
  const [visibleCertificate, setVisibleCertificate] = useState<string | null>(null);

  const classStudents = mockStudents.filter(student =>
    student.class === currentUser?.assignedClass
  );

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const totalStudents = classStudents.length;

    let totalAttendance = 0;
    let eligibleCount = 0;

    classStudents.forEach(student => {
      const attendance = storageUtils.calculateAttendancePercentage(student.id);
      totalAttendance += attendance;

      if (storageUtils.isEligibleForNoDue(student.id)) {
        eligibleCount++;
      }
    });

    setStats({
      totalStudents,
      averageAttendance: totalStudents > 0 ? Math.round(totalAttendance / totalStudents) : 0,
      eligibleForNoDue: eligibleCount
    });
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
                <p className="text-2xl font-bold text-gray-900">{stats.averageAttendance}%</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.eligibleForNoDue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
              <div className="grid gap-4">
                {classStudents.map(student => {
                  const attendance = storageUtils.calculateAttendancePercentage(student.id);
                  const isEligible = storageUtils.isEligibleForNoDue(student.id);

                  return (
                    <div
                      key={student.id}
                      className={`p-4 border rounded-lg space-y-4 ${
                        isEligible ? 'bg-green-50 border-green-200' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">
                            Roll: {student.rollNumber} | {student.email}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={attendance >= 75 ? "default" : "destructive"}>
                            {attendance}% Attendance
                          </Badge>
                          {isEligible && (
                            <Badge variant="default" className="bg-green-600">
                              No Due Eligible
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <button
                          onClick={() =>
                            setVisibleCertificate(prev =>
                              prev === student.id ? null : student.id
                            )
                          }
                          className="text-indigo-600 text-sm font-medium hover:underline"
                        >
                          {visibleCertificate === student.id ? 'Hide Certificate' : 'View No Due Certificate'}
                        </button>
                      </div>

                      {visibleCertificate === student.id && (
                        <div className="mt-4">
                          <NoDueCertificate studentId={student.id} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
