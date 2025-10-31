import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AttendanceManagerProps {
  userClass?: string;
  userSubject?: string;
}

interface Student {
  student_id: string;
  student_name: string;
  attended_classes?: number;
  total_classes?: number;
}

interface Subject {
  subject_id: number;
  subject_name: string;
}

interface ClassData {
  class_id: number;
  class_name: string;
}

const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  userClass,
  userSubject,
}) => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState(userClass || "");
  const [selectedSubject, setSelectedSubject] = useState(userSubject || "");
  const [attendance, setAttendance] = useState<{ [key: string]: number }>({});
  const [totalClasses, setTotalClasses] = useState<number>(50);

  // ✅ Fetch classes and subjects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, subjectRes] = await Promise.all([
          fetch("http://localhost:3001/classes"),
          fetch("http://localhost:3001/subjects"),
        ]);

        if (!classRes.ok || !subjectRes.ok)
          throw new Error("Failed to load classes/subjects");

        const classData = await classRes.json();
        const subjectData = await subjectRes.json();

        setClasses(classData);
        setSubjects(subjectData);

        // Auto-select IDs if props contain names
        if (userClass && !selectedClass) {
          const foundClass = classData.find(
            (c: ClassData) => c.class_name === userClass
          );
          if (foundClass) setSelectedClass(String(foundClass.class_id));
        }

        if (userSubject && !selectedSubject) {
          const foundSubject = subjectData.find(
            (s: Subject) => s.subject_name === userSubject
          );
          if (foundSubject) setSelectedSubject(String(foundSubject.subject_id));
        }
      } catch (error) {
        console.error("❌ Error loading classes/subjects:", error);
        toast.error("Error loading classes or subjects");
      }
    };

    fetchData();
  }, [userClass, userSubject]);

  // ✅ Fetch students of selected class
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) return;
      try {
        const res = await fetch(
          `http://localhost:3001/students?class=${selectedClass}`
        );
        if (!res.ok) throw new Error("Failed to fetch students");
        const data = await res.json();
        setStudents(data);
      } catch (error) {
        console.error("❌ Error loading students:", error);
        toast.error("Error loading students");
      }
    };

    fetchStudents();
  }, [selectedClass]);

  // ✅ Load attendance for class & subject
  useEffect(() => {
    const loadAttendance = async () => {
      if (!selectedClass || !selectedSubject) return;
      try {
        const res = await fetch(
          `http://localhost:3001/attendance?class=${selectedClass}&subject=${selectedSubject}`
        );
        if (!res.ok) throw new Error("Failed to fetch attendance");
        const data = await res.json();

        const attendanceMap: { [key: string]: number } = {};
        data.forEach((record: Student) => {
          attendanceMap[record.student_id] = record.attended_classes || 0;
        });

        setAttendance(attendanceMap);
        if (data.length > 0 && data[0].total_classes)
          setTotalClasses(data[0].total_classes);
      } catch (error) {
        console.error("❌ Error loading attendance:", error);
        toast.error("Error loading attendance records");
      }
    };

    loadAttendance();
  }, [selectedClass, selectedSubject]);

  // ✅ Update attendance
  const updateAttendance = (studentId: string, value: number) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: Math.max(0, Math.min(totalClasses, value)),
    }));
  };

  // ✅ Save attendance (fixed mapping for class_name → class_id)
  const saveAttendance = async () => {
    try {
      // Step 1: Resolve classId
      let classId: number | null = null;
      if (isNaN(Number(selectedClass))) {
        const cls = classes.find((c) => c.class_name === selectedClass);
        classId = cls ? cls.class_id : null;
      } else {
        classId = parseInt(selectedClass);
      }

      // Step 2: Resolve subjectId
      let subjectId: number | null = null;
      if (isNaN(Number(selectedSubject))) {
        const sub = subjects.find((s) => s.subject_name === selectedSubject);
        subjectId = sub ? sub.subject_id : null;
      } else {
        subjectId = parseInt(selectedSubject);
      }

      if (!classId || !subjectId) {
        toast.error("Please select valid class and subject");
        return;
      }

      // Step 3: Save attendance
      for (const student of students) {
        const payload = {
          student_id: student.student_id,
          subject_id: subjectId,
          class_id: classId,
          total_classes: totalClasses,
          attended_classes: attendance[student.student_id] ?? 0,
        };

        console.log("📦 Sending payload:", payload);

        const response = await fetch("http://localhost:3001/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to save attendance");
        }
      }

      toast.success("✅ Attendance saved successfully!");
    } catch (error) {
      console.error("❌ Error saving attendance:", error);
      toast.error("Error saving attendance");
    }
  };

  return (
    <Card className="bg-white/95 shadow-xl rounded-2xl backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-indigo-700">
          <span>Attendance Management</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!userClass && (
            <div>
              <label className="text-sm font-medium text-gray-700">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {classes.map((cls) => (
                    <SelectItem key={cls.class_id} value={String(cls.class_id)}>
                      {cls.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!userSubject && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Subject
              </label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {subjects.map((subject) => (
                    <SelectItem
                      key={subject.subject_id}
                      value={String(subject.subject_id)}
                    >
                      {subject.subject_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {selectedClass && selectedSubject && (
          <>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">
                Students ({students.length})
              </h3>
              <div className="grid gap-2">
                {students.map((student) => {
                  const attended = attendance[student.student_id] ?? 0;
                  const percentage =
                    totalClasses > 0
                      ? Math.round((attended / totalClasses) * 100)
                      : 0;

                  return (
                    <div
                      key={student.student_id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <div className="font-medium">
                          {student.student_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {student.student_id}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="number"
                          min={0}
                          max={totalClasses}
                          value={attended}
                          onChange={(e) =>
                            updateAttendance(
                              student.student_id,
                              parseInt(e.target.value)
                            )
                          }
                          className="w-20 px-2 py-1 border rounded-md text-center"
                        />
                        <Badge
                          variant={percentage >= 75 ? "default" : "destructive"}
                        >
                          {percentage}%
                        </Badge>
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
