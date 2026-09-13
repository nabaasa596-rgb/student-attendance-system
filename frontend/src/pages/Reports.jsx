import { useEffect, useState } from "react";
import API from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Sidebar from "../components/Sidebar";
import "./Reports.css";


function Reports() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await API.get("/attendance");
      setRecords(response.data);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const students = [
    ...new Map(
      records.map((record) => [
        record.student_id,
        {
          student_id: record.student_id,
          lin_number: record.lin_number,
          student_name: record.student_name,
          class_name: record.class_name,
        },
      ])
    ).values(),
  ];

  const getStats = (studentId) => {
    const data = records.filter(
      (r) => r.student_id === studentId
    );

    const present = data.filter(
      (r) => r.status === "Present"
    ).length;

    const absent = data.filter(
      (r) => r.status === "Absent"
    ).length;

    const late = data.filter(
      (r) => r.status === "Late"
    ).length;

    const total = data.length;

    const percentage =
      total === 0 ? 0 : Math.round((present + late) / total * 100);

    return {
      total,
      present,
      absent,
      late,
      percentage,
    };
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("SCHOOL ATTENDANCE REPORT", 105, 18, {
      align: "center",
    });

    doc.setFontSize(11);
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      105,
      26,
      { align: "center" }
    );

    const summaryData = students.map((student) => {
      const stats = getStats(student.student_id);

      return [
        student.lin_number,
        student.student_name,
        student.class_name,
        stats.total,
        stats.present,
        stats.absent,
        stats.late,
        `${stats.percentage}%`,
      ];
    });

    autoTable(doc, {
      startY: 35,
      head: [
        [
          "LIN",
          "Student",
          "Class",
          "Total",
          "Present",
          "Absent",
          "Late",
          "Attendance %",
        ],
      ],
      body: summaryData,
      theme: "grid",
      styles: {
        fontSize: 8,
      },
      headStyles: {
        fontStyle: "bold",
      },
    });

    doc.save("school-attendance-report.pdf");
  };

  if (loading) {
    return <p>Loading reports...</p>;
  }

  return (
    <div className="reports-layout">
      <Sidebar />

      <main className="reports-main">
        <div className="reports-header">
          <div>
            <h1>Attendance Reports</h1>
            <p>View and download student attendance reports.</p>
          </div>

          <button
            className="print-btn"
            onClick={downloadPDF}
          >
            📄 Download PDF
          </button>
        </div>

        <div className="summary-cards">
          <div>
            <span>Total Records</span>
            <strong>{records.length}</strong>
          </div>

          <div>
            <span>Present</span>
            <strong>
              {records.filter(
                (r) => r.status === "Present"
              ).length}
            </strong>
          </div>

          <div>
            <span>Absent</span>
            <strong>
              {records.filter(
                (r) => r.status === "Absent"
              ).length}
            </strong>
          </div>

          <div>
            <span>Late</span>
            <strong>
              {records.filter(
                (r) => r.status === "Late"
              ).length}
            </strong>
          </div>
        </div>

        <div className="report-table-container">
          <h2>Student Attendance Summary</h2>

          <table>
            <thead>
              <tr>
                <th>LIN</th>
                <th>Student</th>
                <th>Class</th>
                <th>Total</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Attendance %</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => {
                const stats = getStats(student.student_id);

                return (
                  <tr key={student.student_id}>
                    <td>{student.lin_number}</td>
                    <td>{student.student_name}</td>
                    <td>{student.class_name}</td>
                    <td>{stats.total}</td>
                    <td>{stats.present}</td>
                    <td>{stats.absent}</td>
                    <td>{stats.late}</td>
                    <td>
                      <strong>{stats.percentage}%</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="detailed-report">
          <h2>Detailed Attendance</h2>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => (
                <tr key={record.attendance_id}>
                  <td>
                    {String(record.attendance_date).slice(0, 10)}
                  </td>
                  <td>{record.student_name}</td>
                  <td>{record.class_name}</td>
                  <td>{record.subject_name}</td>
                  <td>{record.teacher_name}</td>
                  <td>
                    <span
                      className={`status ${record.status.toLowerCase()}`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Reports;