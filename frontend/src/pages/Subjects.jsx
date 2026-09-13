import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import "./Subjects.css";


function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    subject_code: "",
    subject_name: "",
  });
  const [editingId, setEditingId] = useState(null);

  const loadSubjects = async () => {
    try {
      const response = await API.get("/subjects");
      setSubjects(response.data);
    } catch (error) {
      console.error("Failed to load subjects:", error);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveSubject = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await API.put(`/subjects/${editingId}`, form);
        alert("Subject updated successfully!");
      } else {
        await API.post("/subjects", form);
        alert("Subject added successfully!");
      }

      resetForm();
      loadSubjects();
    } catch (error) {
      console.error(error);
      alert("Failed to save subject.");
    }
  };

  const editSubject = (subject) => {
    setEditingId(subject.subject_id);

    setForm({
      subject_code: subject.subject_code,
      subject_name: subject.subject_name,
    });
  };

  const deleteSubject = async (id) => {
    if (!window.confirm("Delete this subject?")) return;

    try {
      await API.delete(`/subjects/${id}`);
      alert("Subject deleted successfully!");
      loadSubjects();
    } catch (error) {
      console.error(error);
      alert("Failed to delete subject.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      subject_code: "",
      subject_name: "",
    });
  };

  return (
    <div className="subjects-layout">
      <Sidebar />

      <main className="subjects-main">
        <h1>Subjects</h1>
        <p>Manage school subjects.</p>

        <form className="subject-form" onSubmit={saveSubject}>
          <input
            name="subject_code"
            placeholder="Subject Code e.g. MATH"
            value={form.subject_code}
            onChange={handleChange}
            required
          />

          <input
            name="subject_name"
            placeholder="Subject Name"
            value={form.subject_name}
            onChange={handleChange}
            required
          />

          <button type="submit">
            {editingId ? "Update Subject" : "Add Subject"}
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

        <div className="subjects-table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Subject</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.subject_id}>
                  <td>{subject.subject_id}</td>
                  <td>{subject.subject_code}</td>
                  <td>{subject.subject_name}</td>

                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => editSubject(subject)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteSubject(subject.subject_id)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {subjects.length === 0 && (
            <p className="empty-message">No subjects found.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Subjects;