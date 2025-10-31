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

export interface FeesRecord {
  studentId: string;
  cleared: boolean;
  amount: number;
  dueDate: string;
}

export interface User {
  id: string;
  name: string;
  role: 'class_teacher' | 'subject_teacher' | 'student' | 'hod' | 'principal';
  assignedClass?: string;
  assignedSubject?: string;
  studentId?: string;
}

export const mockClasses = ['BCA 1st Year', 'BCA 2nd Year', 'BCA 3rd Year'];

export const mockStudents: Student[] = [
  { id: 'S001', name: 'Mohammed Kashif Ali', rollNumber: 'U06PE23S0002', class: 'BCA 3rd Year', email: 'kashif@college.edu' },
  { id: 'S002', name: 'A Tarun', rollNumber: 'U06PE23S0004', class: 'BCA 3rd Year', email: 'tarun@college.edu' },
  { id: 'S003', name: 'Rakshitha M', rollNumber: 'U06PE23S0010', class: 'BCA 3rd Year', email: 'rakshitha.m@college.edu' },
  { id: 'S004', name: 'Nikhil V Shetty', rollNumber: 'U06PE23S0011', class: 'BCA 3rd Year', email: 'nikhil.shetty@college.edu' },
  { id: 'S005', name: 'Tejushree R', rollNumber: 'U06PE23S0013', class: 'BCA 3rd Year', email: 'tejushree@college.edu' },
  { id: 'S006', name: 'Promod K P', rollNumber: 'U06PE23S0014', class: 'BCA 3rd Year', email: 'promod@college.edu' },
  { id: 'S007', name: 'S Sumanth', rollNumber: 'U06PE23S0016', class: 'BCA 3rd Year', email: 'sumanth@college.edu' },
  { id: 'S008', name: 'Ranjini D N', rollNumber: 'U06PE23S0017', class: 'BCA 3rd Year', email: 'ranjini@college.edu' },
  { id: 'S009', name: 'NITHIN DIVIGIHALLI', rollNumber: 'U06PE23S0019', class: 'BCA 3rd Year', email: 'nithin@college.edu' },
  { id: 'S010', name: 'PAAVANA B K', rollNumber: 'U06PE23S0022', class: 'BCA 3rd Year', email: 'paavana@college.edu' },
  { id: 'S011', name: 'BHANU PRAKASH RAO', rollNumber: 'U06PE23S0028', class: 'BCA 3rd Year', email: 'bhanu@college.edu' },
  { id: 'S012', name: 'G P CHANDANA', rollNumber: 'U06PE23S0031', class: 'BCA 3rd Year', email: 'chandana@college.edu' },
  { id: 'S013', name: 'Darshan P.A', rollNumber: 'U06PE23S0032', class: 'BCA 3rd Year', email: 'darshan@college.edu' },
  { id: 'S014', name: 'HEMANTH G', rollNumber: 'U06PE23S0033', class: 'BCA 3rd Year', email: 'hemanth@college.edu' },
  { id: 'S015', name: 'Sandhya S', rollNumber: 'U06PE23S0036', class: 'BCA 3rd Year', email: 'sandhya@college.edu' },
  { id: 'S016', name: 'PRANATHI S P', rollNumber: 'U06PE23S0037', class: 'BCA 3rd Year', email: 'pranathi@college.edu' },
  { id: 'S017', name: 'Roystan Fernandes', rollNumber: 'U06PE23S0038', class: 'BCA 3rd Year', email: 'roystan@college.edu' },
  { id: 'S018', name: 'Rakshitha R Patel', rollNumber: 'U06PE23S0039', class: 'BCA 3rd Year', email: 'rakshitha.patel@college.edu' },
  { id: 'S019', name: 'Anu A', rollNumber: 'U06PE23S0044', class: 'BCA 3rd Year', email: 'anu@college.edu' },
  { id: 'S020', name: 'ANANYA L', rollNumber: 'U06PE23S0045', class: 'BCA 3rd Year', email: 'ananya.l@college.edu' },
];

export const mockSubjects: Subject[] = [
  { id: 'SUB001', name: 'R-Programming', code: 'RP301' },
  { id: 'SUB002', name: 'ADA', code: 'CS302' },
  { id: 'SUB003', name: 'Software Engineering', code: 'SE303' },
  { id: 'SUB004', name: 'Cloud Computing', code: 'CC304' },
  { id: 'SUB005', name: 'Cyber Security', code: 'CS305' },
  { id: 'SUB006', name: 'Digital Marketing', code: 'DM306' },
  { id: 'SUB007', name: 'R-Programming Lab', code: 'RP307' },
  { id: 'SUB008', name: 'ADA Lab', code: 'CS308' },
];

export const mockUsers: User[] = [
  { id: 'U001', name: 'Prof. Anderson', role: 'class_teacher', assignedClass: 'BCA 1st Year' },
  { id: 'U002', name: 'Prof. Martinez', role: 'class_teacher', assignedClass: 'BCA 2nd Year' },
  { id: 'U003', name: 'Prof. Gupta', role: 'class_teacher', assignedClass: 'BCA 3rd Year' },
  { id: 'U004', name: 'Dr. Rao', role: 'subject_teacher', assignedSubject: 'R-Programming' },
  { id: 'U005', name: 'Dr. Mehta', role: 'subject_teacher', assignedSubject: 'ADA' },
  { id: 'U006', name: 'John Doe', role: 'student', studentId: 'S001' },
  { id: 'U007', name: 'Jane Smith', role: 'student', studentId: 'S002' },

  // ✅ New Roles
  { id: 'U008', name: 'Dr. Priya Sharma', role: 'hod' },
  { id: 'U009', name: 'Dr. Suresh Rao', role: 'principal' },
];

export const generateInitialAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const dates = ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19'];

  mockStudents.forEach((student) => {
    mockSubjects.forEach((subject) => {
      dates.forEach((date) => {
        records.push({
          id: `ATT_${student.id}_${subject.id}_${date}`,
          studentId: student.id,
          subject: subject.name,
          date,
          present: Math.random() > 0.2, // 80% present rate
        });
      });
    });
  });

  return records;
};

export const generateInitialFees = (): FeesRecord[] => {
  return mockStudents.map((student) => ({
    studentId: student.id,
    cleared: Math.random() > 0.3, // 70% paid
    amount: 50000,
    dueDate: '2024-02-15',
  }));
};
