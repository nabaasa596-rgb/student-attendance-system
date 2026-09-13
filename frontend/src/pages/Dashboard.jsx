import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  // rest of your code...
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [students, teachers, classes, subjects] =
          await Promise.all([
            API.get("/students"),
            API.get("/teachers"),
            API.get("/classes"),
            API.get("/subjects"),
          ]);

        setStats({
          students: students.data.length,
          teachers: teachers.data.length,
          classes: classes.data.length,
          subjects: subjects.data.length,
        });
      } catch (error) {
        console.error(
          "Failed to load dashboard statistics:",
          error
        );
      }
    };

    loadStats();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>
              Welcome to the School Attendance Management System.
            </p>
          </div>

<div className="admin-profile">
  👤 {user?.username} ({user?.role})
</div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span>👨‍🎓</span>

            <div>
              <h3>Students</h3>
              <strong>{stats.students}</strong>
            </div>
          </div>

          <div className="stat-card">
            <span>👨‍🏫</span>

            <div>
              <h3>Teachers</h3>
              <strong>{stats.teachers}</strong>
            </div>
          </div>

          <div className="stat-card">
            <span>🏫</span>

            <div>
              <h3>Classes</h3>
              <strong>{stats.classes}</strong>
            </div>
          </div>

          <div className="stat-card">
            <span>📚</span>

            <div>
              <h3>Subjects</h3>
              <strong>{stats.subjects}</strong>
            </div>
          </div>
        </section>

        <section className="welcome-card">
          <h2>School Attendance System</h2>

          <p>
            Manage students, teachers, classes, subjects,
            timetable, attendance and reports from one place.
          </p>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;