export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  email: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subject: string;
  date: string;
  present: boolean;
}

export interface MarksRecord {
  id: string;
  studentId: string;
  subject: string;
  marks: number;
  maxMarks: number;
  examType: string;
}

export interface FeesRecord {
  studentId: string;
  cleared: boolean;
  amount: number;
  dueDate: string;
}

export interface User {
  id: string;
  name: string;
  role: 'class_teacher' | 'subject_teacher' | 'student';
  assignedClass?: string;
  assignedSubject?: string;
  studentId?: string;
}

export const mockClasses = ['BCA 1st Year', 'BCA 2nd Year', 'BCA 3rd Year'];

export const mockStudents: Student[] = [
  { id: 'S001', name: 'John Doe', rollNumber: 'BCA101', class: 'BCA 1st Year', email: 'john@college.edu' },
  { id: 'S002', name: 'Jane Smith', rollNumber: 'BCA102', class: 'BCA 1st Year', email: 'jane@college.edu' },
  { id: 'S003', name: 'Mike Johnson', rollNumber: 'BCA201', class: 'BCA 2nd Year', email: 'mike@college.edu' },
  { id: 'S004', name: 'Sarah Wilson', rollNumber: 'BCA202', class: 'BCA 2nd Year', email: 'sarah@college.edu' },
  { id: 'S005', name: 'David Brown', rollNumber: 'BCA301', class: 'BCA 3rd Year', email: 'david@college.edu' },
  { id: 'S006', name: 'Emily Davis', rollNumber: 'BCA302', class: 'BCA 3rd Year', email: 'emily@college.edu' },
  { id: 'S007', name: 'Alex Chen', rollNumber: 'BCA303', class: 'BCA 3rd Year', email: 'alex@college.edu' },
  { id: 'S008', name: 'Lisa Garcia', rollNumber: 'BCA304', class: 'BCA 3rd Year', email: 'lisa@college.edu' },
];

export const mockSubjects: Subject[] = [
  { id: 'SUB001', name: 'Data Structures', code: 'CS201' },
  { id: 'SUB002', name: 'Database Management', code: 'CS202' },
  { id: 'SUB003', name: 'Web Development', code: 'CS203' },
  { id: 'SUB004', name: 'Operating Systems', code: 'CS204' },
  { id: 'SUB005', name: 'Computer Networks', code: 'CS205' },
];

export const mockUsers: User[] = [
  { id: 'U001', name: 'Prof. Anderson', role: 'class_teacher', assignedClass: 'BCA 1st Year' },
  { id: 'U002', name: 'Prof. Martinez', role: 'class_teacher', assignedClass: 'BCA 2nd Year' },
  { id: 'U003', name: 'Prof. Gupta', role: 'class_teacher', assignedClass: 'BCA 3rd Year' },
  { id: 'U004', name: 'Dr. Thompson', role: 'subject_teacher', assignedSubject: 'Data Structures' },
  { id: 'U005', name: 'Dr. Lee', role: 'subject_teacher', assignedSubject: 'Database Management' },
  { id: 'U006', name: 'John Doe', role: 'student', studentId: 'S001' },
  { id: 'U007', name: 'Jane Smith', role: 'student', studentId: 'S002' },
];

export const generateInitialAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const dates = ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19'];

  mockStudents.forEach(student => {
    mockSubjects.forEach(subject => {
      dates.forEach(date => {
        records.push({
          id: `ATT_${student.id}_${subject.id}_${date}`,
          studentId: student.id,
          subject: subject.name,
          date,
          present: Math.random() > 0.2
        });
      });
    });
  });

  return records;
};

export const generateInitialMarks = (): MarksRecord[] => {
  const records: MarksRecord[] = [];
  const examTypes = ['Quiz 1', 'Mid Term', 'Quiz 2', 'Final'];

  mockStudents.forEach(student => {
    mockSubjects.forEach(subject => {
      examTypes.forEach(examType => {
        const maxMarks = examType.includes('Quiz') ? 20 : 100;
        records.push({
          id: `MARKS_${student.id}_${subject.id}_${examType}`,
          studentId: student.id,
          subject: subject.name,
          marks: Math.floor(Math.random() * maxMarks * 0.8) + Math.floor(maxMarks * 0.2),
          maxMarks,
          examType
        });
      });
    });
  });

  return records;
};

export const generateInitialFees = (): FeesRecord[] => {
  return mockStudents.map(student => ({
    studentId: student.id,
    cleared: Math.random() > 0.3,
    amount: 50000,
    dueDate: '2024-02-15'
  }));
};
