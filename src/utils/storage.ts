import { AttendanceRecord, MarksRecord, FeesRecord, User } from './mockData';

const STORAGE_KEYS = {
  ATTENDANCE: 'college_attendance',
  MARKS: 'college_marks',
  FEES: 'college_fees',
  CURRENT_USER: 'college_current_user'
};

export const storageUtils = {
  // Attendance operations
  getAttendance: (): AttendanceRecord[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return stored ? JSON.parse(stored) : [];
  },

  saveAttendance: (attendance: AttendanceRecord[]): void => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  },

  addAttendanceRecord: (record: AttendanceRecord): void => {
    const existing = storageUtils.getAttendance();
    const filtered = existing.filter(r => 
      !(r.studentId === record.studentId && r.subject === record.subject && r.date === record.date)
    );
    filtered.push(record);
    storageUtils.saveAttendance(filtered);
  },

  // Marks operations
  getMarks: (): MarksRecord[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.MARKS);
    return stored ? JSON.parse(stored) : [];
  },

  saveMarks: (marks: MarksRecord[]): void => {
    localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify(marks));
  },

  addMarksRecord: (record: MarksRecord): void => {
    const existing = storageUtils.getMarks();
    const filtered = existing.filter(r => 
      !(r.studentId === record.studentId && r.subject === record.subject && r.examType === record.examType)
    );
    filtered.push(record);
    storageUtils.saveMarks(filtered);
  },

  // Fees operations
  getFees: (): FeesRecord[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.FEES);
    return stored ? JSON.parse(stored) : [];
  },

  saveFees: (fees: FeesRecord[]): void => {
    localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(fees));
  },

  // User operations
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  },

  setCurrentUser: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  clearCurrentUser: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // Calculate attendance percentage
  calculateAttendancePercentage: (studentId: string, subject?: string): number => {
    const attendance = storageUtils.getAttendance();
    let studentAttendance = attendance.filter(record => record.studentId === studentId);
    
    if (subject) {
      studentAttendance = studentAttendance.filter(record => record.subject === subject);
    }

    if (studentAttendance.length === 0) return 0;

    const presentCount = studentAttendance.filter(record => record.present).length;
    return Math.round((presentCount / studentAttendance.length) * 100);
  },

  // Check if student is eligible for No Due Certificate
  isEligibleForNoDue: (studentId: string): boolean => {
    const attendancePercentage = storageUtils.calculateAttendancePercentage(studentId);
    const fees = storageUtils.getFees();
    const studentFees = fees.find(f => f.studentId === studentId);
    
    return attendancePercentage >= 75 && (studentFees?.cleared || false);
  }
};