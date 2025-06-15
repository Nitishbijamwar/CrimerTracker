import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ReportCrime from "./pages/ReportCrime";
import WitnessForm from "./pages/WitnessForm";
import CaseDetails from "./pages/CaseDetails";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import AdminDashboard from "./pages/AdminDashboard";
import LawyerDashboard from "./pages/LawyerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import NotificationPanel from "./pages/NotificationPannel";

function App() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ReportCrime />
            </ProtectedRoute>
          }
        />
        <Route
          path="/witness"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <WitnessForm />
            </ProtectedRoute>
          }
        />

        {/* Shared Case Details */}
        <Route
          path="/case/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "lawyer", "user"]}>
              <CaseDetails />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Lawyer Routes */}
        <Route
          path="/lawyer-dashboard"
          element={
            <ProtectedRoute allowedRoles={["lawyer"]}>
              <LawyerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/notifications" element={<NotificationPanel />} />
      </Routes>
    </>
  );
}

export default App;
