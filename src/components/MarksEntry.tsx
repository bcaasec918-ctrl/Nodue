import React, { useState, useEffect } from 'react';
import { mockStudents, mockSubjects, MarksRecord } from '../utils/mockData';
import { storageUtils } from '../utils/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Save } from 'lucide-react';
import { toast } from 'sonner';

interface MarksEntryProps {
  userClass?: string;
  userSubject?: string;
}

const MarksEntry: React.FC<MarksEntryProps> = ({ userClass, userSubject }) => {
  const [selectedClass, setSelectedClass] = useState(userClass || '');
  const [selectedSubject, setSelectedSubject] = useState(userSubject || '');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [marks, setMarks] = useState<{ [key: string]: number }>({});

  const examTypes = ['Quiz 1', 'Quiz 2', 'Mid Term', 'Assignment 1', 'Assignment 2', 'Final'];

  const filteredStudents = userClass 
    ? mockStudents.filter(student => student.class === userClass)
    : mockStudents.filter(student => student.class === selectedClass);

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedExamType) {
      loadExistingMarks();
    }
  }, [selectedClass, selectedSubject, selectedExamType]);

  const loadExistingMarks = () => {
    const existingMarks = storageUtils.getMarks();
    const examMarks: { [key: string]: number } = {};
    
    filteredStudents.forEach(student => {
      const record = existingMarks.find(m => 
        m.studentId === student.id && 
        m.subject === selectedSubject && 
        m.examType === selectedExamType
      );
      examMarks[student.id] = record?.marks || 0;
      if (record) {
        setMaxMarks(record.maxMarks);
      }
    });
    
    setMarks(examMarks);
  };

  const updateMarks = (studentId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue <= maxMarks) {
      setMarks(prev => ({
        ...prev,
        [studentId]: numValue
      }));
    }
  };

  const saveMarks = () => {
    if (!selectedSubject || !selectedExamType) {
      toast.error('Please select subject and exam type');
      return;
    }

    filteredStudents.forEach(student => {
      const record: MarksRecord = {
        id: `MARKS_${student.id}_${selectedSubject}_${selectedExamType}`,
        studentId: student.id,
        subject: selectedSubject,
        marks: marks[student.id] || 0,
        maxMarks,
        examType: selectedExamType
      };
      storageUtils.addMarksRecord(record);
    });

    toast.success('Marks saved successfully!');
  };

  const getStudentAverage = (studentId: string): number => {
    const studentMarks = storageUtils.getMarks().filter(m => 
      m.studentId === studentId && m.subject === selectedSubject
    );
    
    if (studentMarks.length === 0) return 0;
    
    const totalPercentage = studentMarks.reduce((sum, mark) => 
      sum + (mark.marks / mark.maxMarks) * 100, 0
    );
    
    return Math.round(totalPercentage / studentMarks.length);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>Marks Entry</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {!userClass && (
            <div>
              <label className="text-sm font-medium">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
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
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {mockSubjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium">Exam Type</label>
            <Select value={selectedExamType} onValueChange={setSelectedExamType}>
              <SelectTrigger>
                <SelectValue placeholder="Select exam" />
              </SelectTrigger>
              <SelectContent>
                {examTypes.map(exam => (
                  <SelectItem key={exam} value={exam}>{exam}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Max Marks</label>
            <Input
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(parseInt(e.target.value) || 100)}
              min="1"
              max="1000"
            />
          </div>
        </div>

        {selectedClass && selectedSubject && selectedExamType && (
          <>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">
                Enter Marks for {selectedExamType} - {selectedSubject} (Max: {maxMarks})
              </h3>
              <div className="grid gap-3">
                {filteredStudents.map(student => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-500">
                          Roll: {student.rollNumber} | Class: {student.class}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">
                        Avg: {getStudentAverage(student.id)}%
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={marks[student.id] || ''}
                          onChange={(e) => updateMarks(student.id, e.target.value)}
                          placeholder="0"
                          min="0"
                          max={maxMarks}
                          className="w-20"
                        />
                        <span className="text-sm text-gray-500">/ {maxMarks}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={saveMarks} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Marks
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MarksEntry;