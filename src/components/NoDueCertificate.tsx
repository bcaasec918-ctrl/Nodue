import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "../contexts/AuthContext";

interface NoDueCertificateProps {
  studentId: string;
  approverRole?: "class_teacher" | "hod" | "principal";
}

interface Student {
  student_id: string;
  student_name: string;
  class_id: number;
  class_name: string;
  email?: string;
}

interface Attendance {
  subject_name: string;
  total_classes: number;
  attended_classes: number;
}

interface Fees {
  cleared: boolean;
}

const NoDueCertificate: React.FC<NoDueCertificateProps> = ({
  studentId,
  approverRole,
}) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [fees, setFees] = useState<Fees | null>(null);
  const [overallPercentage, setOverallPercentage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [signatures, setSignatures] = useState({
    classTeacher: false,
    hod: false,
    principal: false,
  });
  const certificateRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const resNoDue = await fetch(`http://localhost:3001/nodue/${studentId}`);
        if (!resNoDue.ok) throw new Error("Failed to fetch NoDue data");
        const noDueData = await resNoDue.json();

        setAttendance(noDueData.subjects || []);
        setFees({ cleared: noDueData.feesCleared });
        setOverallPercentage(noDueData.attendancePercentage || 0);
        setSignatures({
          classTeacher: noDueData.approvals?.class_teacher || false,
          hod: noDueData.approvals?.hod || false,
          principal: noDueData.approvals?.principal || false,
        });

        const resStudent = await fetch(`http://localhost:3001/students/${studentId}`);
        if (!resStudent.ok) throw new Error("Student not found");
        const studentData = await resStudent.json();
        setStudent(studentData);
      } catch (err) {
        console.error("❌ Error fetching NoDue data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [studentId]);

  const handleApprove = async () => {
    if (!currentUser && !approverRole) {
      alert("Please login or specify an approver role.");
      return;
    }

    const role = currentUser?.role || approverRole;

    // ✅ Sequential approval enforcement
    if (role === "hod" && !signatures.classTeacher) {
      alert("Class Teacher approval is required before HOD approval.");
      return;
    }
    if (role === "principal" && (!signatures.classTeacher || !signatures.hod)) {
      alert("Both Class Teacher and HOD approvals are required before Principal approval.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/nodue/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, role }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Approval failed");
      }

      const data = await res.json();
      alert(data.message);

      // 🔄 Refresh data after approval
      const updated = await fetch(`http://localhost:3001/nodue/${studentId}`);
      const updatedData = await updated.json();

      setSignatures({
        classTeacher: updatedData.approvals?.class_teacher || false,
        hod: updatedData.approvals?.hod || false,
        principal: updatedData.approvals?.principal || false,
      });
    } catch (err) {
      console.error("❌ Approval failed:", err);
      alert("Approval failed. Please check console for details.");
    }
  };

  const generatePDF = async () => {
    if (!certificateRef.current) return;
    const canvas = await html2canvas(certificateRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfHeight);

    const fileName = `NoDue_${student?.student_name?.replace(/\s+/g, "_")}_${new Date()
      .toISOString()
      .split("T")[0]}.pdf`;
    pdf.save(fileName);
  };

  if (loading) return <div>Loading certificate...</div>;
  if (!student) return <div>Student not found.</div>;

  const isEligible = overallPercentage >= 75 && fees?.cleared;

  // ✅ Determine button visibility based on sequential rules
  const role = currentUser?.role || approverRole;
  const canApprove =
    (role === "class_teacher" && !signatures.classTeacher) ||
    (role === "hod" && signatures.classTeacher && !signatures.hod) ||
    (role === "principal" && signatures.classTeacher && signatures.hod && !signatures.principal);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>No Due Certificate</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div
          ref={certificateRef}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-300"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <img src="/logo.png" alt="College Logo" className="mx-auto h-16 mb-2" />
            <h2 className="text-2xl font-bold text-indigo-700">No Due Certificate</h2>
          </div>

          {/* Student Info */}
          <div className="space-y-4 text-gray-800 text-sm">
            <p
              className="text-lg md:text-xl font-serif leading-relaxed text-gray-900 text-justify tracking-wide"
              style={{
                fontFamily: "'Times New Roman', 'Georgia', serif",
                fontWeight: 500,
                lineHeight: "1.8",
              }}
            >
              This is to certify that{" "}
              <strong>{student.student_name}</strong> (ID:{" "}
              <strong>{student.student_id}</strong>) of class{" "}
              <strong>{student.class_name}</strong> has successfully completed all
              formalities and has no outstanding dues with the college, and is
              therefore{" "}
              <strong>eligible to appear for the University Examination.</strong>
            </p>

            <div className="grid grid-cols-2 gap-4 mt-4 text-base">
              <div>
                <span className="text-gray-600 font-medium">Fees Status:</span>
                <div className="font-semibold">
                  {fees?.cleared ? "Cleared" : "Pending"}
                </div>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Class:</span>
                <div className="font-semibold">{student.class_name}</div>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Issue Date:</span>
                <div className="font-semibold">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Attendance Summary
            </h3>
            <table className="min-w-full border border-gray-300 text-sm text-left">
              <thead className="bg-indigo-50 text-indigo-700">
                <tr>
                  <th className="px-3 py-2 border">Subject</th>
                  <th className="px-3 py-2 border">Attended</th>
                  <th className="px-3 py-2 border">Total</th>
                  <th className="px-3 py-2 border">%</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((a, i) => {
                  const percent = a.total_classes
                    ? ((a.attended_classes / a.total_classes) * 100).toFixed(2)
                    : "0.00";
                  return (
                    <tr key={i} className="even:bg-gray-50">
                      <td className="px-3 py-2 border">{a.subject_name}</td>
                      <td className="px-3 py-2 border">{a.attended_classes}</td>
                      <td className="px-3 py-2 border">{a.total_classes}</td>
                      <td className="px-3 py-2 border">{percent}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="mt-10 grid grid-cols-3 gap-6 text-center text-sm text-gray-700">
            {["classTeacher", "hod", "principal"].map((role) => (
              <div key={role}>
                {signatures[role as keyof typeof signatures] ? (
                  <img
                    src={`/signatures/${role}.png`}
                    alt={`${role} Signature`}
                    className="mx-auto h-10"
                  />
                ) : (
                  <div className="h-10"></div>
                )}
                <div className="border-t border-gray-400 mt-2"></div>
                <div>
                  {role === "classTeacher"
                    ? "Class Teacher"
                    : role === "hod"
                    ? "Head of Department"
                    : "Principal"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="border-t pt-4 space-y-3">
          {canApprove && (
            <Button
              onClick={handleApprove}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Approve & Sign (
              {(approverRole || currentUser?.role)?.replace("_", " ").toUpperCase()}
              )
            </Button>
          )}

          <Button onClick={generatePDF} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download as PDF
          </Button>

          {isEligible ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                Eligible for No Due Certificate
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">
                Not Eligible for No Due Certificate
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NoDueCertificate;
