import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import "./Assignments.css";


function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);

  const [form, setForm] = useState({
    teacher_id: "",
    subject_id: "",
    class_id: "",
  });

  const [editingId, setEditingId] = useState(null);

  const loadData = async () => {
    try {
      const [a, t, s, c] = await Promise.all([
        API.get("/assignments"),
        API.get("/teachers"),
        API.get("/subjects"),
        API.get("/classes"),
      ]);

      setAssignments(a.data);
      setTeachers(t.data);
      setSubjects(s.data);
      setClasses(c.data);
    } catch (error) {
      console.error("Failed to load assignments:", error);
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

  const saveAssignment = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await API.put(`/assignments/${editingId}`, form);
        alert("Assignment updated successfully!");
      } else {
        await API.post("/assignments", form);
        alert("Assignment added successfully!");
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to save assignment.");
    }
  };

  const editAssignment = (item) => {
    setEditingId(item.assignment_id);

    setForm({
      teacher_id: item.teacher_id,
      subject_id: item.subject_id,
      class_id: item.class_id,
    });
  };

  const deleteAssignment = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;

    try {
      await API.delete(`/assignments/${id}`);

      alert("Assignment deleted successfully!");
      loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete assignment.");
    }
  };

  const resetForm = () => {
    setEditingId(null);

    setForm({
      teacher_id: "",
      subject_id: "",
      class_id: "",
    });
  };

  return (
    <div className="assignments-layout">
      <Sidebar />

      <main className="assignments-main">
        <h1>Teacher Assignments</h1>
        <p>Assign teachers to subjects and classes.</p>

        <form className="assignment-form" onSubmit={saveAssignment}>
          <select
            name="teacher_id"
            value={form.teacher_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Teacher</option>

            {teachers.map((teacher) => (
              <option
                key={teacher.teacher_id}
                value={teacher.teacher_id}
              >
                {teacher.teacher_name} ({teacher.teacher_code})
              </option>
            ))}
          </select>

          <select
            name="subject_id"
            value={form.subject_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Subject</option>

            {subjects.map((subject) => (
              <option
                key={subject.subject_id}
                value={subject.subject_id}
              >
                {subject.subject_name} ({subject.subject_code})
              </option>
            ))}
          </select>

          <select
            name="class_id"
            value={form.class_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Class</option>

            {classes.map((item) => (
              <option key={item.class_id} value={item.class_id}>
                {item.class_name}
              </option>
            ))}
          </select>

          <button type="submit">
            {editingId ? "Update Assignment" : "Assign Teacher"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-btn"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </form>

        <div className="assignments-table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Teacher</th>
                <th>Subject</th>
                <th>Class</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {assignments.map((item) => (
                <tr key={item.assignment_id}>
                  <td>{item.assignment_id}</td>
                  <td>{item.teacher_name}</td>
                  <td>{item.subject_name}</td>
                  <td>{item.class_name}</td>

                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => editAssignment(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteAssignment(item.assignment_id)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {assignments.length === 0 && (
            <p className="empty-message">
              No teacher assignments found.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Assignments;