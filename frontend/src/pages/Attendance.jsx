
import { useEffect, useState } from "react";
import API from "../services/api";
import "./Attendance.css";

function Attendance() {
  const [timetable, setTimetable] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendance, setAttendance] = useState({});

  const loadTimetable = async () => {
    try {
      const response = await API.get("/timetable");
      setTimetable(response.data);
    } catch (error) {
      console.error("Failed to load timetable:", error);
    }
  };

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadStudents = async (timetableId) => {
    try {
      const lesson = timetable.find(
        (item) => item.timetable_id === Number(timetableId)
      );

      if (!lesson) return;

      const response = await API.get(
        `/students?class_id=${lesson.class_id}`
      );

      setStudents(response.data);

      const initialAttendance = {};

      response.data.forEach((student) => {
        initialAttendance[student.student_id] = "Present";
      });

      setAttendance(initialAttendance);
    } catch (error) {
      console.error("Failed to load students:", error);
    }
  };

  const handleLessonChange = (e) => {
    const value = e.target.value;

    setSelectedLesson(value);

    if (value) {
      loadStudents(value);
    } else {
      setStudents([]);
      setAttendance({});
    }
  };

  const changeStatus = (studentId, status) => {
    setAttendance((previous) => ({
      ...previous,
      [studentId]: status,
    }));
  };

  const markAll = (status) => {
    const updated = {};

    students.forEach((student) => {
      updated[student.student_id] = status;
    });

    setAttendance(updated);
  };

  const saveAttendance = async () => {
    if (!selectedLesson) {
      alert("Please select a lesson.");
      return;
    }

    if (students.length === 0) {
      alert("No students found for this lesson.");
      return;
    }

    try {
      for (const student of students) {
        await API.post("/attendance", {
          student_id: student.student_id,
          timetable_id: Number(selectedLesson),
          attendance_date: attendanceDate,
          status: attendance[student.student_id],
        });
      }

      alert("Attendance saved successfully!");
    } catch (error) {
      console.error("Error saving attendance:", error);

      alert(
        error.response?.data?.error ||
          "Attendance could not be saved. Some records may already exist."
      );
    }
  };

  const selected = timetable.find(
    (item) => item.timetable_id === Number(selectedLesson)
  );

  return (
    <div className="attendance-layout">
      <main className="attendance-main">
        <div className="attendance-header">
          <div>
            <h1>Digital Attendance</h1>
            <p>Mark and manage student attendance.</p>
          </div>
        </div>

        <section className="attendance-controls">
          <div>
            <label htmlFor="attendance-date">Date</label>

            <input
              id="attendance-date"
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </div>

          <div className="lesson-select">
            <label htmlFor="lesson-select">Select Lesson</label>

            <select
              id="lesson-select"
              value={selectedLesson}
              onChange={handleLessonChange}
            >
              <option value="">Select lesson</option>

              {timetable.map((item) => (
                <option
                  key={item.timetable_id}
                  value={item.timetable_id}
                >
                  {item.day_of_week} | Period {item.period_number} |{" "}
                  {item.subject_name} | {item.class_name} |{" "}
                  {item.start_time?.slice(0, 5)}-
                  {item.end_time?.slice(0, 5)}
                </option>
              ))}
            </select>
          </div>
        </section>

        {selected && (
          <div className="lesson-card">
            <h2>{selected.subject_name}</h2>

            <p>
              <strong>Class:</strong> {selected.class_name}
            </p>

            <p>
              <strong>Teacher:</strong> {selected.teacher_name}
            </p>

            <p>
              <strong>Time:</strong>{" "}
              {selected.start_time?.slice(0, 5)} -{" "}
              {selected.end_time?.slice(0, 5)}
            </p>
          </div>
        )}

        {students.length > 0 && (
          <>
            <div className="attendance-actions">
              <button
                type="button"
                onClick={() => markAll("Present")}
              >
                ✓ Mark All Present
              </button>

              <button
                type="button"
                onClick={() => markAll("Absent")}
              >
                ✕ Mark All Absent
              </button>
            </div>

            <div className="attendance-table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>LIN Number</th>
                    <th>Student Name</th>
                    <th>Gender</th>
                    <th>Attendance Status</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student, index) => (
                    <tr key={student.student_id}>
                      <td>{index + 1}</td>
                      <td>{student.lin_number}</td>
                      <td>{student.student_name}</td>
                      <td>{student.gender}</td>

                      <td>
                        <div className="status-buttons">
                          {[
                            "Present",
                            "Absent",
                            "Late",
                            "Excused",
                          ].map((status) => (
                            <button
                              type="button"
                              key={status}
                              className={
                                attendance[student.student_id] ===
                                status
                                  ? `active ${status.toLowerCase()}`
                                  : ""
                              }
                              onClick={() =>
                                changeStatus(
                                  student.student_id,
                                  status
                                )
                              }
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              className="save-attendance-btn"
              onClick={saveAttendance}
            >
              💾 Save Attendance
            </button>
          </>
        )}

        {!selectedLesson && (
          <div className="empty-attendance">
            <h2>📝 Attendance Ready</h2>
            <p>
              Select a lesson above to load its students.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Attendance;
