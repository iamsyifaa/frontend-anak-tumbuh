import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { SchoolMasterPage } from "./pages/SchoolMasterPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<ProtectedRoute allowedRoles={["super_admin", "kepala_sekolah"]} requiredPermission="read:school_master" />}>
            <Route path="/dashboard/admin" element={<SchoolMasterPage />} />
            <Route path="/dashboard/kepsek" element={<SchoolMasterPage />} />
          </Route>

          <Route path="/dashboard/siswa" element={<StudentDashboard />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
