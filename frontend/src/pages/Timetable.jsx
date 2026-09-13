import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import "./Timetable.css";


function Timetable() {
  const [timetable, setTimetable] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [form, setForm] = useState({
    assignment_id: "",
    day_of_week: "Monday",
    period_number: 1,
    start_time: "08:00",
    end_time: "09:00",
  });

  const [editingId, setEditingId] = useState(null);

  const loadData = async () => {
    try {
      const [timetableRes, assignmentsRes] = await Promise.all([
        API.get("/timetable"),
        API.get("/assignments"),
      ]);

      setTimetable(timetableRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error("Failed to load timetable:", error);
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

  const saveTimetable = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...form,
        period_number: Number(form.period_number),
      };

      if (editingId) {
        await API.put(`/timetable/${editingId}`, data);
        alert("Timetable updated successfully!");
      } else {
        await API.post("/timetable", data);
        alert("Timetable entry added successfully!");
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to save timetable entry.");
    }
  };

  const editTimetable = (item) => {
    setEditingId(item.timetable_id);

    setForm({
      assignment_id: item.assignment_id,
      day_of_week: item.day_of_week,
      period_number: item.period_number,
      start_time: item.start_time?.slice(0, 5),
      end_time: item.end_time?.slice(0, 5),
    });
  };

  const deleteTimetable = async (id) => {
    if (!window.confirm("Delete this timetable entry?")) return;

    try {
      await API.delete(`/timetable/${id}`);
      alert("Timetable entry deleted!");
      loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete timetable entry.");
    }
  };

  const resetForm = () => {
    setEditingId(null);

    setForm({
      assignment_id: "",
      day_of_week: "Monday",
      period_number: 1,
      start_time: "08:00",
      end_time: "09:00",
    });
  };

  return (
    <div className="timetable-layout">
      <Sidebar />

      <main className="timetable-main">
        <h1>Timetable</h1>
        <p>Schedule subjects, teachers, classes and periods.</p>

        <form className="timetable-form" onSubmit={saveTimetable}>
          <select
            name="assignment_id"
            value={form.assignment_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Teacher / Subject / Class</option>

            {assignments.map((item) => (
              <option
                key={item.assignment_id}
                value={item.assignment_id}
              >
                {item.teacher_name} — {item.subject_name} —{" "}
                {item.class_name}
              </option>
            ))}
          </select>

          <select
            name="day_of_week"
            value={form.day_of_week}
            onChange={handleChange}
          >
            <option>Monday</option>
            <option>Tuesday</option>
            <option>Wednesday</option>
            <option>Thursday</option>
            <option>Friday</option>
            <option>Saturday</option>
          </select>

          <input
            type="number"
            name="period_number"
            min="1"
            max="15"
            value={form.period_number}
            onChange={handleChange}
            required
          />

          <input
            type="time"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            required
          />

          <input
            type="time"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            required
          />

          <button type="submit">
            {editingId ? "Update Timetable" : "Add to Timetable"}
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

        <div className="timetable-table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Day</th>
                <th>Period</th>
                <th>Time</th>
                <th>Teacher</th>
                <th>Subject</th>
                <th>Class</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {timetable.map((item) => (
                <tr key={item.timetable_id}>
                  <td>{item.timetable_id}</td>
                  <td>{item.day_of_week}</td>
                  <td>{item.period_number}</td>
                  <td>
                    {item.start_time?.slice(0, 5)} -{" "}
                    {item.end_time?.slice(0, 5)}
                  </td>
                  <td>{item.teacher_name}</td>
                  <td>{item.subject_name}</td>
                  <td>{item.class_name}</td>

                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => editTimetable(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteTimetable(item.timetable_id)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {timetable.length === 0 && (
            <p className="empty-message">
              No timetable entries found.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Timetable;