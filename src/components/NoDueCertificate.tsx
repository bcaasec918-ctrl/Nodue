import React, { useRef } from 'react';
import { mockStudents } from '../utils/mockData';
import { storageUtils } from '../utils/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle, XCircle, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface NoDueCertificateProps {
  studentId: string;
}

const NoDueCertificate: React.FC<NoDueCertificateProps> = ({ studentId }) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const student = mockStudents.find(s => s.id === studentId);
  const attendancePercentage = storageUtils.calculateAttendancePercentage(studentId);
  const isEligible = storageUtils.isEligibleForNoDue(studentId);
  const fees = storageUtils.getFees();
  const studentFees = fees.find(f => f.studentId === studentId);

  const generatePDF = async () => {
    if (!certificateRef.current || !isEligible) return;

    const canvas = await html2canvas(certificateRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pdfHeight);
    pdf.save(`no_due_certificate_${student?.rollNumber}.pdf`);
  };

  if (!student) {
    return <div>Student not found</div>;
  }

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
          <div className="text-center mb-6">
            <img src="/logo.png" alt="College Logo" className="mx-auto h-16 mb-2" />
            <h2 className="text-2xl font-bold text-indigo-700">College Management System</h2>
            <p className="text-sm text-gray-600">No Due Certificate</p>
          </div>

          <div className="space-y-4 text-gray-800 text-sm">
            <p>
              This is to certify that <strong>{student.name}</strong> (Roll No: <strong>{student.rollNumber}</strong>) of class <strong>{student.class}</strong> has cleared all dues and is eligible for the No Due Certificate.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <span className="text-gray-500">Attendance:</span>
                <div className="font-medium">{attendancePercentage}%</div>
              </div>
              <div>
                <span className="text-gray-500">Fees Status:</span>
                <div className="font-medium">{studentFees?.cleared ? 'Cleared' : 'Pending'}</div>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <div className="font-medium">{student.email}</div>
              </div>
              <div>
                <span className="text-gray-500">Issue Date:</span>
                <div className="font-medium">{new Date().toLocaleDateString()}</div>
              </div>
            </div>

            <p className="mt-6">
              This certificate is generated electronically and is valid without signature.
            </p>
          </div>

          {/* Academic Summary Table */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Academic Summary</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 text-sm text-left">
                <thead className="bg-indigo-50 text-indigo-700">
                  <tr>
                    <th className="px-3 py-2 border">Subject</th>
                    <th className="px-3 py-2 border">Assignment</th>
                    <th className="px-3 py-2 border">Attendance</th>
                    <th className="px-3 py-2 border">Records</th>
                    <th className="px-3 py-2 border">Seminar</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <tr key={index} className="even:bg-gray-50">
                      <td className="px-3 py-2 border">Subject {index + 1}</td>
                      <td className="px-3 py-2 border">✓</td>
                      <td className="px-3 py-2 border">✓</td>
                      <td className="px-3 py-2 border">✓</td>
                      <td className="px-3 py-2 border">✓</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mt-10 grid grid-cols-3 gap-6 text-center text-sm text-gray-700">
            <div>
              <div className="border-t border-gray-400 h-0 mb-2"></div>
              <div>Class Teacher</div>
            </div>
            <div>
              <div className="border-t border-gray-400 h-0 mb-2"></div>
              <div>Head of Department</div>
            </div>
            <div>
              <div className="border-t border-gray-400 h-0 mb-2"></div>
              <div>Principal</div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          {isEligible ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Eligible for No Due Certificate</span>
              </div>
              <Button onClick={generatePDF} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download as PDF
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Not Eligible for No Due Certificate</span>
              </div>
              <div className="text-sm text-gray-600">
                Please ensure you meet all requirements:
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {attendancePercentage < 75 && (
                    <li>Maintain at least 75% attendance (currently {attendancePercentage}%)</li>
                  )}
                  {!studentFees?.cleared && (
                    <li>Clear all pending fees</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NoDueCertificate;
