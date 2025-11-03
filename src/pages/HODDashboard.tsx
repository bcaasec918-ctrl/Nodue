import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import NoDueCertificate from "../components/NoDueCertificate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, Search } from "lucide-react";

const HODDashboard: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<
    Record<string, { eligible: boolean }>
  >({});
  const [visibleCertificate, setVisibleCertificate] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortFilter, setSortFilter] = useState<
    "all" | "eligible" | "notEligible"
  >("all");

  // ✅ Fetch all students and their no-due status
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.getStudents();
        const data = Array.isArray(res) ? res : res.data || [];
        setStudents(data);
        setFilteredStudents(data);

        // Fetch eligibility for each student
        const eligibilityMap: Record<string, { eligible: boolean }> = {};

        await Promise.all(
          data.map(async (student) => {
            try {
              const nodue = await api.getNoDueStatus(student.student_id);
              eligibilityMap[student.student_id] = {
                eligible: !!nodue?.eligible,
              };
            } catch (err) {
              console.error(`❌ Error fetching no-due for ${student.student_id}:`, err);
              eligibilityMap[student.student_id] = { eligible: false };
            }
          })
        );

        setStudentData(eligibilityMap);
      } catch (err) {
        console.error("❌ Error fetching students:", err);
      }
    };

    fetchStudents();
  }, []);

  // ✅ Search + Filter + Sort logic
  useEffect(() => {
    let updated = [...students];

    // 🔍 Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      updated = updated.filter(
        (student) =>
          student.student_name.toLowerCase().includes(term) ||
          student.student_id.toString().includes(term)
      );
    }

    // 🧩 Eligibility sort
    if (sortFilter === "eligible") {
      updated.sort((a, b) => {
        const aEligible = studentData[a.student_id]?.eligible ? -1 : 1;
        const bEligible = studentData[b.student_id]?.eligible ? -1 : 1;
        return aEligible - bEligible;
      });
    } else if (sortFilter === "notEligible") {
      updated.sort((a, b) => {
        const aEligible = studentData[a.student_id]?.eligible ? 1 : -1;
        const bEligible = studentData[b.student_id]?.eligible ? 1 : -1;
        return aEligible - bEligible;
      });
    }

    setFilteredStudents(updated);
  }, [students, searchTerm, sortFilter, studentData]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">HOD Dashboard</h1>
        <p className="text-gray-600">View and approve No Due Certificates</p>
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
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by student name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Eligibility Filter Badges */}
              <div className="flex items-center gap-3 mb-4">
                <Badge
                  onClick={() => setSortFilter("eligible")}
                  className={`cursor-pointer px-3 py-1 text-sm font-medium ${
                    sortFilter === "eligible"
                      ? "bg-green-600 text-white"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  ✅ Eligible
                </Badge>

                <Badge
                  onClick={() => setSortFilter("notEligible")}
                  className={`cursor-pointer px-3 py-1 text-sm font-medium ${
                    sortFilter === "notEligible"
                      ? "bg-red-600 text-white"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  ❌ Not Eligible
                </Badge>

                <Badge
                  onClick={() => setSortFilter("all")}
                  className={`cursor-pointer px-3 py-1 text-sm font-medium ${
                    sortFilter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  🔄 Show All
                </Badge>
              </div>

              {/* Student List */}
              {filteredStudents.length === 0 ? (
                <p className="text-gray-500">No students found.</p>
              ) : (
                <div className="grid gap-4">
                  {filteredStudents.map((student) => {
                    const eligible = studentData[student.student_id]?.eligible;

                    return (
                      <div
                        key={student.student_id}
                        className={`p-4 border rounded-lg shadow-sm transition ${
                          eligible
                            ? "bg-green-50 border-green-200"
                            : "bg-white border-gray-200"
                        }`}
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

                          <div className="flex items-center space-x-2">
                            <Badge>
                              {student.class_name || `Class ${student.class_id}`}
                            </Badge>
                            {eligible ? (
                              <Badge className="bg-green-600 text-white">
                                Eligible
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700">
                                Not Eligible
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-right mt-3">
                          <button
                            onClick={() =>
                              setVisibleCertificate((prev) =>
                                prev === student.student_id
                                  ? null
                                  : student.student_id
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
                              approverRole="hod"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HODDashboard;
