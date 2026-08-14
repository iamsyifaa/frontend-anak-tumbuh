import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { StudentDashboard } from "./components/StudentDashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Halaman Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard Siswa */}
          <Route path="/dashboard/siswa" element={<StudentDashboard />} />

          {/* Jika URL tidak ditemukan */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
