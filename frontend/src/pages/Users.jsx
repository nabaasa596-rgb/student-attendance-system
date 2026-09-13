import React, { useEffect, useState } from "react";
import api from "../services/api";
import "./Users.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error loading users:", error);

      alert(
        error.response?.data?.error ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId, username) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${username}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/users/${userId}`);

      alert("User deleted successfully. ✅");

      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);

      alert(
        error.response?.data?.error ||
          "Failed to delete user."
      );
    }
  };

  return (
    <div className="users-page">

      <div className="users-header">
        <div>
          <h1>User Management</h1>
          <p>
            Manage system accounts and their roles.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchUsers}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="users-card">

        <div className="users-card-header">
          <h2>System Users</h2>

          <span className="user-count">
            {users.length} User
            {users.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="users-message">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="users-message">
            No users found.
          </div>
        ) : (
          <div className="users-table-wrapper">

            <table className="users-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {users.map((user, index) => (
                  <tr key={user.user_id}>

                    <td>{index + 1}</td>

                    <td className="username">
                      {user.username}
                    </td>

                    <td>
                      <span
                        className={`role-badge ${
                          user.role === "admin"
                            ? "admin-role"
                            : "teacher-role"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>
                      {user.role === "admin" ? (
                        <span className="protected-text">
                          Protected
                        </span>
                      ) : (
                        <button
                          className="delete-user-btn"
                          onClick={() =>
                            handleDelete(
                              user.user_id,
                              user.username
                            )
                          }
                        >
                          Delete
                        </button>
                      )}
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

export default Users;