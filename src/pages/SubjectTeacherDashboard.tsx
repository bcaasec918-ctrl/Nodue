import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockStudents } from '../utils/mockData';
import { storageUtils } from '../utils/storage';
import AttendanceManager from '../components/AttendanceManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, TrendingUp } from 'lucide-react';

const SubjectTeacherDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedClass, setSelectedClass] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageAttendance: 0
  });

  const availableClasses = Array.from(new Set(mockStudents.map(s => s.class)));

  useEffect(() => {
    if (selectedClass && currentUser?.assignedSubject) {
      calculateStats();
    }
  }, [selectedClass, currentUser?.assignedSubject]);

  const calculateStats = () => {
    const classStudents = mockStudents.filter(s => s.class === selectedClass);
    const totalStudents = classStudents.length;
    let totalAttendance = 0;

    classStudents.forEach(student => {
      const attendance = storageUtils.calculateAttendancePercentage(
        student.id,
        currentUser?.assignedSubject
      );
      totalAttendance += attendance;
    });

    setStats({
      totalStudents,
      averageAttendance: totalStudents > 0 ? Math.round(totalAttendance / totalStudents) : 0
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subject Teacher Dashboard</h1>
          <p className="text-gray-600">Teaching: {currentUser?.assignedSubject}</p>
        </div>
      </div>

      {/* Class Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class to Manage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableClasses.map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`p-3 border rounded-lg text-center font-medium transition-colors ${
                  selectedClass === cls
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedClass && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Students in {selectedClass}</p>
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
                    <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageAttendance}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="students" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="students">Students Overview</TabsTrigger>
              <TabsTrigger value="attendance">Mark Attendance</TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>{selectedClass} - {currentUser?.assignedSubject}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {mockStudents
                      .filter(student => student.class === selectedClass)
                      .map(student => {
                        const attendance = storageUtils.calculateAttendancePercentage(
                          student.id,
                          currentUser?.assignedSubject
                        );

                        return (
                          <div
                            key={student.id}
                            className="p-4 border rounded-lg bg-white"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">
                                  Roll: {student.rollNumber} | {student.email}
                                </div>
                              </div>
                              <Badge variant={attendance >= 75 ? "default" : "destructive"}>
                                {attendance}% Attendance
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance">
              <AttendanceManager
                userClass={selectedClass}
                userSubject={currentUser?.assignedSubject}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default SubjectTeacherDashboard;
