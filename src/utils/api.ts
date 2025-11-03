const BASE_URL = 'http://localhost:3001'; // Update if deploying to a live server

export const api = {
  // 🧑‍🎓 Get all students
  getStudents: async () => {
    const res = await fetch(`${BASE_URL}/students`);
    if (!res.ok) throw new Error('Failed to fetch students');
    return await res.json();
  },

  // 🏫 Get all classes
  getClasses: async () => {
    const res = await fetch(`${BASE_URL}/classes`);
    if (!res.ok) throw new Error('Failed to fetch classes');
    return await res.json();
  },

  // 👩‍🏫 Get all teachers
  getTeachers: async () => {
    const res = await fetch(`${BASE_URL}/teachers`);
    if (!res.ok) throw new Error('Failed to fetch teachers');
    return await res.json();
  },

  // 📚 Get all subjects (flattened from classes.subjects JSONB)
  getSubjects: async () => {
    const res = await fetch(`${BASE_URL}/classes`);
    if (!res.ok) throw new Error('Failed to fetch subjects');
    const classes = await res.json();

    const allSubjects = classes.flatMap((cls: any) => cls.subjects || []);
    const uniqueSubjects = Array.from(new Set(allSubjects));
    return uniqueSubjects.map((name, i) => {
      const subjectName = String(name);
      return {
        id: i + 1,
        name: subjectName,
        code: subjectName.slice(0, 3).toUpperCase(),
      };
    });
  },

  // 📈 Get attendance for a student
  getAttendance: async (studentId: string) => {
    const res = await fetch(`${BASE_URL}/attendance/${studentId}`);
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return await res.json();
  },

  // 💰 Get fee status for a student
  getFees: async (studentId: string) => {
    const res = await fetch(`${BASE_URL}/fees/${studentId}`);
    if (!res.ok) throw new Error('Failed to fetch fees');
    return await res.json();
  },

  // ✅ Get No Due eligibility for a student
  getNoDueStatus: async (studentId: string) => {
    const res = await fetch(`${BASE_URL}/nodue/${studentId}`);
    if (!res.ok) throw new Error('Failed to fetch No Due status');
    return await res.json();
  },

  // 🧾 Update fee clearance (Admin privilege)
  updateFeeStatus: async (studentId: string, classId: number, cleared: boolean) => {
  const res = await fetch(`${BASE_URL}/api/nodue/fee/${studentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cleared, class_id: classId }),
  });
  if (!res.ok) throw new Error('Failed to update fee status');
  return await res.json();
},

};
