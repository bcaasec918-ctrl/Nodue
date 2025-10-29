import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockStudents, mockClasses, mockSubjects } from '../utils/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, BookOpen, GraduationCap } from 'lucide-react';

const RoleSelector: React.FC = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = () => {
    let user;
    if (selectedRole === 'class_teacher') {
      user = {
        id: 'CT_' + selectedClass,
        name: username || `Prof. ${selectedClass} Teacher`,
        role: 'class_teacher' as const,
        assignedClass: selectedClass
      };
    } else if (selectedRole === 'subject_teacher') {
      user = {
        id: 'ST_' + selectedSubject,
        name: username || `Dr. ${selectedSubject} Teacher`,
        role: 'subject_teacher' as const,
        assignedSubject: selectedSubject
      };
    } else if (selectedRole === 'student') {
      const student = mockStudents.find(s => s.id === selectedStudent);
      user = {
        id: 'U_' + selectedStudent,
        name: username || student?.name || 'Student',
        role: 'student' as const,
        studentId: selectedStudent
      };
    } else return;

    login(user);
  };

  const isFormValid = () => {
    if (!selectedRole || !username || !password) return false;
    if (selectedRole === 'class_teacher' && !selectedClass) return false;
    if (selectedRole === 'subject_teacher' && !selectedSubject) return false;
    if (selectedRole === 'student' && !selectedStudent) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-50 via-blue-50 to-white flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-2xl border-none rounded-2xl bg-white/95 backdrop-blur-md">
        <CardHeader className="text-center px-6 pt-6">
          <CardTitle className="text-3xl font-extrabold text-indigo-800">College Management Login</CardTitle>
          <CardDescription className="text-indigo-600 mt-2">
            Enter your credentials and select your role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-6">

          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-indigo-700">Username</label>
            <Input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="bg-white border border-indigo-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-indigo-700">Password</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="bg-white border border-indigo-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Role Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-indigo-700">Select Role</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="bg-white border border-indigo-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400">
                <SelectValue placeholder="Choose your role" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-indigo-300 rounded-lg shadow-md">
                <SelectItem value="class_teacher" className="flex items-center space-x-2 hover:bg-indigo-50">
                  <UserCheck className="h-4 w-4 text-indigo-500" />
                  <span>Class Teacher</span>
                </SelectItem>
                <SelectItem value="subject_teacher" className="flex items-center space-x-2 hover:bg-indigo-50">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  <span>Subject Teacher</span>
                </SelectItem>
                <SelectItem value="student" className="flex items-center space-x-2 hover:bg-indigo-50">
                  <GraduationCap className="h-4 w-4 text-indigo-500" />
                  <span>Student</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Selectors */}
          {selectedRole === 'class_teacher' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-indigo-700">Select Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="bg-white border border-indigo-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400">
                  <SelectValue placeholder="Choose your class" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-indigo-300 rounded-lg shadow-md">
                  {mockClasses.map(cls => (
                    <SelectItem key={cls} value={cls} className="hover:bg-indigo-50">{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedRole === 'subject_teacher' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-indigo-700">Select Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="bg-white border border-indigo-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400">
                  <SelectValue placeholder="Choose your subject" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-indigo-300 rounded-lg shadow-md">
                  {mockSubjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.name} className="hover:bg-indigo-50">
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedRole === 'student' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-indigo-700">Select Student</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="bg-white border border-indigo-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400">
                  <SelectValue placeholder="Choose your profile" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-indigo-300 rounded-lg shadow-md">
                  {mockStudents.map(student => (
                    <SelectItem key={student.id} value={student.id} className="hover:bg-indigo-50">
                      {student.name} ({student.rollNumber}) - {student.class}
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
