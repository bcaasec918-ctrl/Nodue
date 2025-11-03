import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import NoDueCertificate from "../components/NoDueCertificate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrincipalDashboard: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<Record<string, { eligible: boolean }>>({});
  const [visibleCertificate, setVisibleCertificate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortFilter, setSortFilter] = useState<"all" | "eligible" | "notEligible">("all");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // ✅ Fetch students + eligibility + pending approvals
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1️⃣ Fetch all students
        const res = await api.getStudents();
        const data = Array.isArray(res) ? res : res.data || [];
        setStudents(data);
        setFilteredStudents(data);

        // 2️⃣ Fetch eligibility for each
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

        // 3️⃣ Fetch pending approvals (HOD done, principal pending)
        const pendingRes = await fetch("http://localhost:3001/nodue/pending/principal");
        if (pendingRes.ok) {
          const pending = await pendingRes.json();
          setNotifications(pending);
        }
      } catch (err) {
        console.error("❌ Error fetching principal data:", err);
      }
    };

    fetchAllData();
  }, []);

  // ✅ Search + Filter logic
  useEffect(() => {
    let updated = [...students];

    // 🔍 Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      updated = updated.filter(
        (student) =>
          student.student_name.toLowerCase().includes(term) ||
          student.student_id.toLowerCase().includes(term)
      );
    }

    // 🧩 Eligibility filters
    if (sortFilter === "eligible") {
      updated = updated.filter((s) => studentData[s.student_id]?.eligible);
    } else if (sortFilter === "notEligible") {
      updated = updated.filter((s) => !studentData[s.student_id]?.eligible);
    }

    setFilteredStudents(updated);
  }, [students, searchTerm, sortFilter, studentData]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Principal Dashboard</h1>
          <p className="text-gray-600">
            Review and give final approval for No Due Certificates
          </p>
        </div>

        {/* 🔔 Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            className="relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-6 w-6 text-gray-700" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-600"></span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white border rounded-lg shadow-lg z-20 p-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Pending HOD Approvals
              </h3>
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm">No pending approvals</p>
              ) : (
                <ul className="max-h-64 overflow-auto text-sm">
                  {notifications.map((n) => (
                    <li
                      key={n.student_id}
                      className="py-2 px-3 border-b last:border-none hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setVisibleCertificate(n.student_id);
                        setShowNotifications(false);
                      }}
                    >
                      <div className="font-medium text-gray-900">
                        {n.student_name}
                      </div>
                      <div className="text-gray-500 text-xs">
                        ID: {n.student_id} | {n.class_name}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
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
              {/* 🔍 Search */}
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

              {/* 🧩 Filters */}
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

              {/* 🧾 Student Cards */}
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

export default PrincipalDashboard;
