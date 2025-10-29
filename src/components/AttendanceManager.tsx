import React, { useState, useEffect } from 'react';
import { mockStudents, mockSubjects, AttendanceRecord } from '../utils/mockData';
import { storageUtils } from '../utils/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AttendanceManagerProps {
  userClass?: string;
  userSubject?: string;
}

const AttendanceManager: React.FC<AttendanceManagerProps> = ({ userClass, userSubject }) => {
  const [selectedClass, setSelectedClass] = useState(userClass || '');
  const [selectedSubject, setSelectedSubject] = useState(userSubject || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});

  const filteredStudents = userClass
    ? mockStudents.filter(student => student.class === userClass)
    : mockStudents.filter(student => student.class === selectedClass);

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedDate) {
      loadExistingAttendance();
    }
  }, [selectedClass, selectedSubject, selectedDate]);

  const loadExistingAttendance = () => {
    const existingAttendance = storageUtils.getAttendance();
    const dayAttendance: { [key: string]: boolean } = {};

    filteredStudents.forEach(student => {
      const record = existingAttendance.find(a =>
        a.studentId === student.id &&
        a.subject === selectedSubject &&
        a.date === selectedDate
      );
      dayAttendance[student.id] = record?.present ?? true;
    });

    setAttendance(dayAttendance);
  };

  const toggleAttendance = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const saveAttendance = () => {
    if (!selectedSubject || !selectedDate) {
      toast.error('Please select subject and date');
      return;
    }

    filteredStudents.forEach(student => {
      const record: AttendanceRecord = {
        id: `ATT_${student.id}_${selectedSubject}_${selectedDate}`,
        studentId: student.id,
        subject: selectedSubject,
        date: selectedDate,
        present: attendance[student.id] ?? true
      };
      storageUtils.addAttendanceRecord(record);
    });

    toast.success('Attendance updated successfully!');
  };

  return (
    <Card className="bg-white/95 shadow-xl rounded-2xl backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-indigo-700">
          <Calendar className="h-5 w-5" />
          <span>Attendance Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {!userClass && (
            <div>
              <label className="text-sm font-medium text-gray-700">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(new Set(mockStudents.map(s => s.class))).map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!userSubject && (
            <div>
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {mockSubjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {selectedClass && selectedSubject && (
          <>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Students ({filteredStudents.length})</h3>
              <div className="grid gap-2">
                {filteredStudents.map(student => {
                  const isAbove75 = attendance[student.id] ?? true;

                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-500">
                            Roll: {student.rollNumber} | Class: {student.class}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={isAbove75 ? "default" : "secondary"}>
                          {isAbove75 ? "Above 75%" : "Below 75%"}
                        </Badge>
                        <Button
                          onClick={() => toggleAttendance(student.id)}
                          variant={isAbove75 ? "default" : "outline"}
                          size="sm"
                          className={isAbove75 ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-100 hover:bg-red-200"}
                        >
                          {isAbove75 ? (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-1" />
                          )}
                          {isAbove75 ? 'Above 75%' : 'Below 75%'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={saveAttendance}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              Save Attendance
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceManager;
