import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import NoDueCertificate from "../components/NoDueCertificate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

const PrincipalDashboard: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [visibleCertificate, setVisibleCertificate] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.getStudents();
        const data = Array.isArray(res) ? res : res.data || [];
        setStudents(data);
      } catch (err) {
        console.error("❌ Error fetching students:", err);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Principal Dashboard</h1>
        <p className="text-gray-600">
          Review and give final approval for No Due Certificates
        </p>
      </div>

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2">
          <TabsTrigger value="students">All Students</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Students List</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <p className="text-gray-500">No students found.</p>
              ) : (
                <div className="grid gap-4">
                  {students.map((student) => (
                    <div
                      key={student.student_id}
                      className="p-4 border rounded-lg bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">
                            {student.student_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {student.student_id}
                          </div>
                        </div>
                        <Badge>{student.class_name || `Class ${student.class_id}`}</Badge>
                      </div>

                      <div className="text-right mt-3">
                        <button
                          onClick={() =>
                            setVisibleCertificate((prev) =>
                              prev === student.student_id ? null : student.student_id
                            )
                          }
                          className="text-indigo-600 text-sm font-medium hover:underline"
                        >
                          {visibleCertificate === student.student_id
                            ? "Hide Certificate"
                            : "View No Due Certificate"}
                        </button>
                      </div>

                      {visibleCertificate === student.student_id && (
                        <div className="mt-4">
                          <NoDueCertificate
                            studentId={student.student_id}
                            approverRole="principal"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrincipalDashboard;
