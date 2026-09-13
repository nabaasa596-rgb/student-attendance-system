import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import "./Classes.css";


function Classes() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({
    class_name: "",
    class_teacher_id: "",
  });
  const [editingId, setEditingId] = useState(null);

  const loadData = async () => {
    try {
      const [classesRes, teachersRes] = await Promise.all([
        API.get("/classes"),
        API.get("/teachers"),
      ]);

      setClasses(classesRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      console.error("Failed to load classes:", error);
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

  const saveClass = async (e) => {
    e.preventDefault();

    try {
      const data = {
        class_name: form.class_name,
        class_teacher_id: form.class_teacher_id || null,
      };

      if (editingId) {
        await API.put(`/classes/${editingId}`, data);
        alert("Class updated successfully!");
      } else {
        await API.post("/classes", data);
        alert("Class added successfully!");
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to save class.");
    }
  };

  const editClass = (item) => {
    setEditingId(item.class_id);

    setForm({
      class_name: item.class_name,
      class_teacher_id: item.class_teacher_id || "",
    });
  };

  const deleteClass = async (id) => {
    if (!window.confirm("Delete this class?")) return;

    try {
      await API.delete(`/classes/${id}`);

      alert("Class deleted successfully!");
      loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete class.");
    }
  };

  const resetForm = () => {
    setEditingId(null);

    setForm({
      class_name: "",
      class_teacher_id: "",
    });
  };

  return (
    <div className="classes-layout">
      <Sidebar />

      <main className="classes-main">
        <div className="page-header">
          <div>
            <h1>Classes</h1>
            <p>Manage school classes and class teachers.</p>
          </div>
        </div>

        <form className="class-form" onSubmit={saveClass}>
          <input
            type="text"
            name="class_name"
            placeholder="Class name e.g. S3"
            value={form.class_name}
            onChange={handleChange}
            required
          />

          <select
            name="class_teacher_id"
            value={form.class_teacher_id}
            onChange={handleChange}
          >
            <option value="">No Class Teacher</option>

            {teachers.map((teacher) => (
              <option
                key={teacher.teacher_id}
                value={teacher.teacher_id}
              >
                {teacher.teacher_name} ({teacher.teacher_code})
              </option>
            ))}
          </select>

          <button type="submit">
            {editingId ? "Update Class" : "Add Class"}
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

        <div className="classes-table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Class</th>
                <th>Teacher Code</th>
                <th>Class Teacher</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {classes.map((item) => (
                <tr key={item.class_id}>
                  <td>{item.class_id}</td>
                  <td>{item.class_name}</td>
                  <td>{item.teacher_code || "—"}</td>
                  <td>{item.teacher_name || "Not assigned"}</td>

                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => editClass(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => deleteClass(item.class_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {classes.length === 0 && (
            <p className="empty-message">No classes found.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Classes;