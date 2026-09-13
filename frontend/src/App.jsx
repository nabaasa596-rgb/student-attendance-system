import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import Subjects from "./pages/Subjects";
import Assignments from "./pages/Assignments";
import Timetable from "./pages/Timetable";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import Users from "./pages/Users";

import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* STUDENTS */}
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <Students />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* TEACHERS */}
        <Route
          path="/teachers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <Teachers />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* CLASSES */}
        <Route
          path="/classes"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <Classes />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* SUBJECTS */}
        <Route
          path="/subjects"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <Subjects />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* ASSIGNMENTS */}
        <Route
          path="/assignments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <Assignments />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* TIMETABLE */}
        <Route
          path="/timetable"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher"]}>
              <AppLayout>
                <Timetable />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* ATTENDANCE */}
        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher"]}>
              <AppLayout>
                <Attendance />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* REPORTS */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <Reports />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* USERS */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <Users />
              </AppLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;