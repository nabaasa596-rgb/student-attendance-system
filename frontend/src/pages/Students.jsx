import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import "./Students.css";

function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  const [form, setForm] = useState({
    lin_number: "",
    student_name: "",
    gender: "Male",
    class_id: "",
  });

  const loadData = async () => {
    try {
      const [studentsRes, classesRes] = await Promise.all([
        API.get("/students"),
        API.get("/classes"),
      ]);

      setStudents(studentsRes.data);
      setClasses(classesRes.data);
    } catch (error) {
      console.error("Failed to load students:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const addStudent = async (e) => {
    e.preventDefault();

    try {
      await API.post(
        "/students",
        form
      );

      setForm({
        lin_number: "",
        student_name: "",
        gender: "Male",
        class_id: "",
      });

      loadData();
      alert("Student added successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to add student.");
    }
  };

  return (
    <div className="students-layout">
      <Sidebar />

      <main className="students-main">
        <h1>Students</h1>
        <p>Manage registered students.</p>

        <form className="student-form" onSubmit={addStudent}>
          <input
            name="lin_number"
            placeholder="LIN Number"
            value={form.lin_number}
            onChange={handleChange}
            required
          />

          <input
            name="student_name"
            placeholder="Student Name"
            value={form.student_name}
            onChange={handleChange}
            required
          />

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <select
            name="class_id"
            value={form.class_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Class</option>

            {classes.map((item) => (
              <option
                key={item.class_id}
                value={item.class_id}
              >
                {item.class_name}
              </option>
            ))}
          </select>

          <button type="submit">Add Student</button>
        </form>

        <div className="students-table-container">
          <table>
            <thead>
              <tr>
                <th>LIN Number</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Class</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student.student_id}>
                  <td>{student.lin_number}</td>
                  <td>{student.student_name}</td>
                  <td>{student.gender}</td>
                  <td>{student.class_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Students;