import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "../contexts/AuthContext"; // ✅ Import Auth Context

// ✅ Added approverRole prop
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
  const [loading, setLoading] = useState(true);
  const certificateRef = useRef<HTMLDivElement>(null);

  const { currentUser } = useAuth(); // ✅ Logged-in user info

  // ✅ Track signature approvals
  const [signatures, setSignatures] = useState({
    classTeacher: false,
    hod: false,
    principal: false,
  });

  // ✅ Fetch student + attendance + fee data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resStudent = await fetch(`http://localhost:3001/students/${studentId}`);
        if (!resStudent.ok) throw new Error("Student not found");
        const studentData = await resStudent.json();
        setStudent(studentData);

        const resAttendance = await fetch(`http://localhost:3001/attendance/${studentId}`);
        const attendanceData = resAttendance.ok ? await resAttendance.json() : [];
        setAttendance(attendanceData);

        const resFees = await fetch(`http://localhost:3001/fees/${studentId}`);
        const feeData = resFees.ok ? await resFees.json() : { cleared: false };
        setFees(feeData);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  // ✅ Approve button handler
  const handleApprove = () => {
    if (!currentUser) {
      alert("No role detected! Please login with a valid role.");
      return;
    }

    const role = currentUser.role || approverRole; // ✅ uses passed approverRole if available

    setSignatures((prev) => {
      if (role === "class_teacher") return { ...prev, classTeacher: true };
      if (role === "hod") return { ...prev, hod: true };
      if (role === "principal") return { ...prev, principal: true };
      return prev;
    });
  };

  // ✅ PDF generator
  const generatePDF = async () => {
    if (!certificateRef.current) return;

    const canvas = await html2canvas(certificateRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfHeight);
    pdf.save(`no_due_certificate_${student?.student_id}.pdf`);
  };

  if (loading) return <div>Loading certificate...</div>;
  if (!student) return <div>Student not found.</div>;

  const totalAttended = attendance.reduce((acc, a) => acc + a.attended_classes, 0);
  const totalClasses = attendance.reduce((acc, a) => acc + a.total_classes, 0);
  const attendancePercentage = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(2) : "0.00";
  const isEligible = parseFloat(attendancePercentage) >= 75 && fees?.cleared;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>No Due Certificate</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div ref={certificateRef} className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
          {/* Header */}
          <div className="text-center mb-6">
            <img src="/logo.png" alt="College Logo" className="mx-auto h-16 mb-2" />
            <h2 className="text-2xl font-bold text-indigo-700">College Management System</h2>
            <p className="text-sm text-gray-600">No Due Certificate</p>
          </div>

          {/* Student Info */}
          <div className="space-y-4 text-gray-800 text-sm">
            <p>
              This is to certify that <strong>{student.student_name}</strong> (ID:{" "}
              <strong>{student.student_id}</strong>) of class <strong>{student.class_name}</strong> has cleared
              all dues and is eligible for this certificate.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <span className="text-gray-500">Attendance:</span>
                <div className="font-medium">{attendancePercentage}%</div>
              </div>
              <div>
                <span className="text-gray-500">Fees Status:</span>
                <div className="font-medium">{fees?.cleared ? "Cleared" : "Pending"}</div>
              </div>
              <div>
                <span className="text-gray-500">Class:</span>
                <div className="font-medium">{student.class_name}</div>
              </div>
              <div>
                <span className="text-gray-500">Issue Date:</span>
                <div className="font-medium">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Attendance Summary</h3>
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
            <div>
              {signatures.classTeacher ? (
                <img src="/signatures/class_teacher.png" alt="Class Teacher Signature" className="mx-auto h-10" />
              ) : (
                <div className="h-10"></div>
              )}
              <div className="border-t border-gray-400 mt-2"></div>
              <div>Class Teacher</div>
            </div>
            <div>
              {signatures.hod ? (
                <img src="/signatures/hod.png" alt="HOD Signature" className="mx-auto h-10" />
              ) : (
                <div className="h-10"></div>
              )}
              <div className="border-t border-gray-400 mt-2"></div>
              <div>Head of Department</div>
            </div>
            <div>
              {signatures.principal ? (
                <img src="/signatures/principal.png" alt="Principal Signature" className="mx-auto h-10" />
              ) : (
                <div className="h-10"></div>
              )}
              <div className="border-t border-gray-400 mt-2"></div>
              <div>Principal</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="border-t pt-4 space-y-3">
          {(currentUser && ["class_teacher", "hod", "principal"].includes(currentUser.role)) ||
          approverRole ? (
            <Button onClick={handleApprove} className="w-full bg-green-600 hover:bg-green-700 text-white">
              Approve & Sign (
              {(approverRole || currentUser?.role)?.replace("_", " ").toUpperCase()})
            </Button>
          ) : null}

          {isEligible ? (
            <>
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Eligible for No Due Certificate</span>
              </div>
              <Button onClick={generatePDF} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download as PDF
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Not Eligible for No Due Certificate</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NoDueCertificate;
