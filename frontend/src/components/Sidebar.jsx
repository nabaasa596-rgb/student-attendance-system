import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };

  const user = getUser();

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isTeacher = user?.role?.toLowerCase() === "teacher";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `sidebar-link ${isActive ? "active" : ""}`;

  return (
    <aside className="sidebar">

      {/* HEADER */}
      <div className="sidebar-header">
        <div className="logo-icon">🎓</div>

        <div>
          <h2>School Manager</h2>
          <span>Management System</span>
        </div>
      </div>

      {/* USER */}
      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.username
            ? user.username.charAt(0).toUpperCase()
            : "U"}
        </div>

        <div className="user-info">
          <strong>{user?.username || "User"}</strong>
          <span>{user?.role || "User"}</span>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="sidebar-nav">

        <div className="nav-section-title">
          MAIN
        </div>

        <NavLink to="/dashboard" className={linkClass}>
          <span className="nav-icon">📊</span>
          <span>Dashboard</span>
        </NavLink>

        {/* ADMIN ONLY */}
        {isAdmin && (
          <>
            <div className="nav-section-title">
              SCHOOL MANAGEMENT
            </div>

            <NavLink to="/students" className={linkClass}>
              <span className="nav-icon">👨‍🎓</span>
              <span>Students</span>
            </NavLink>

            <NavLink to="/teachers" className={linkClass}>
              <span className="nav-icon">👨‍🏫</span>
              <span>Teachers</span>
            </NavLink>

            <NavLink to="/classes" className={linkClass}>
              <span className="nav-icon">🏫</span>
              <span>Classes</span>
            </NavLink>

            <NavLink to="/subjects" className={linkClass}>
              <span className="nav-icon">📚</span>
              <span>Subjects</span>
            </NavLink>

            <NavLink to="/assignments" className={linkClass}>
              <span className="nav-icon">📝</span>
              <span>Assignments</span>
            </NavLink>
          </>
        )}

        {/* ACADEMIC */}
        <div className="nav-section-title">
          ACADEMIC
        </div>

        <NavLink to="/timetable" className={linkClass}>
          <span className="nav-icon">🗓️</span>
          <span>Timetable</span>
        </NavLink>

        <NavLink to="/attendance" className={linkClass}>
          <span className="nav-icon">✅</span>
          <span>Attendance</span>
        </NavLink>

        {/* ADMIN */}
        {isAdmin && (
          <>
            <div className="nav-section-title">
              REPORTS & ADMIN
            </div>

            <NavLink to="/reports" className={linkClass}>
              <span className="nav-icon">📈</span>
              <span>Reports</span>
            </NavLink>

            <NavLink to="/users" className={linkClass}>
              <span className="nav-icon">👥</span>
              <span>Users</span>
            </NavLink>
          </>
        )}

      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">

        <div className="logged-in-as">
          Logged in as{" "}
          <strong>
            {isAdmin
              ? "Administrator"
              : isTeacher
              ? "Teacher"
              : "User"}
          </strong>
        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
};

export default Sidebar;