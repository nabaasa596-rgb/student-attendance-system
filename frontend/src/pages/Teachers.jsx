import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./Teachers.css";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);

  const [formData, setFormData] = useState({
    username: "",
    password_hash: "",
    teacher_code: "",
    teacher_name: "",
  });

  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOAD TEACHERS
  // =====================================================

  const fetchTeachers = async () => {
    try {
      const response = await api.get("/teachers");
      setTeachers(response.data);
    } catch (error) {
      console.error("Error loading teachers:", error);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // ADD TEACHER
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.username ||
      !formData.password_hash ||
      !formData.teacher_code ||
      !formData.teacher_name
    ) {
      alert("Please fill in all teacher fields.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/teachers", {
        username: formData.username.trim(),
        password_hash: formData.password_hash,
        teacher_code: formData.teacher_code.trim(),
        teacher_name: formData.teacher_name.trim(),
      });

      alert("Teacher added successfully! ✅");

      setFormData({
        username: "",
        password_hash: "",
        teacher_code: "",
        teacher_name: "",
      });

      await fetchTeachers();
    } catch (error) {
      console.error("Error adding teacher:", error);

      alert(
        error.response?.data?.error ||
          "Failed to add teacher."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE TEACHER
  // =====================================================

  const handleDelete = async (teacherId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this teacher?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/teachers/${teacherId}`);

      alert("Teacher deleted successfully. ✅");

      fetchTeachers();
    } catch (error) {
      console.error("Error deleting teacher:", error);

      alert(
        error.response?.data?.error ||
          "Failed to delete teacher."
      );
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="page-container">

      <div className="page-header">
        <h1>Teachers</h1>
        <p>Manage school teachers and their accounts.</p>
      </div>

      {/* =================================================
          ADD TEACHER FORM
      ================================================= */}

      <div className="form-card">

        <h2>Add Teacher</h2>

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div className="form-group">
              <label>Username</label>

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                name="password_hash"
                value={formData.password_hash}
                onChange={handleChange}
                placeholder="Enter password"
              />
            </div>

            <div className="form-group">
              <label>Teacher Code</label>

              <input
                type="text"
                name="teacher_code"
                value={formData.teacher_code}
                onChange={handleChange}
                placeholder="e.g. T001"
              />
            </div>

            <div className="form-group">
              <label>Teacher Name</label>

              <input
                type="text"
                name="teacher_name"
                value={formData.teacher_name}
                onChange={handleChange}
                placeholder="Enter teacher name"
              />
            </div>

          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Teacher"}
          </button>

        </form>

      </div>

      {/* =================================================
          TEACHERS TABLE
      ================================================= */}

      <div className="table-card">

        <div className="table-header">
          <h2>Teacher List</h2>

          <span className="count">
            {teachers.length} Teacher
            {teachers.length !== 1 ? "s" : ""}
          </span>
        </div>

        {teachers.length === 0 ? (
          <div className="empty-state">
            No teachers found.
          </div>
        ) : (
          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>#</th>
                  <th>Teacher Code</th>
                  <th>Teacher Name</th>
                  <th>Username</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {teachers.map((teacher, index) => (
                  <tr key={teacher.teacher_id}>

                    <td>{index + 1}</td>

                    <td>
                      {teacher.teacher_code}
                    </td>

                    <td>
                      {teacher.teacher_name}
                    </td>

                    <td>
                      {teacher.username || "-"}
                    </td>

                    <td>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(
                            teacher.teacher_id
                          )
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
};

export default Teachers;