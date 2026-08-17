import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { SchoolMasterPage } from "./pages/SchoolMasterPage";
import { StudentManagementPage } from "./pages/StudentManagementPage";
import { StudentAccountManagementPage } from "./pages/StudentAccountManagementPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { HabitConfigurationPage } from "./pages/HabitConfigurationPage";
import { PointConfigurationPage } from "./pages/PointConfigurationPage";
import { QrAuthHandlerPage } from "./pages/QrAuthHandlerPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ReportCenterPage } from "./pages/ReportCenterPage";
import { WaliKelasDashboardPage } from "./pages/WaliKelasDashboardPage";
import { SuperAdminDashboardPage } from "./pages/SuperAdminDashboardPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminDashboardShell } from "./layouts/AdminDashboardShell";
import { TeacherManagementPage } from "./pages/TeacherManagementPage";
import { StudentCertificatePage } from "./pages/StudentCertificatePage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          {/* Public QR handoff: the backend validates the credential in production. */}
          <Route path="/auth/qr" element={<QrAuthHandlerPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<ProtectedRoute allowedRoles={["super_admin"]} requiredPermission="read:school_master" />}>
            <Route element={<AdminDashboardShell />}>
              <Route path="/dashboard/admin" element={<SuperAdminDashboardPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["super_admin", "kepala_sekolah"]} requiredPermission="read:school_master" />}>
            <Route element={<AdminDashboardShell />}>
              <Route path="/dashboard/admin/schools" element={<SchoolMasterPage />} />
              <Route path="/dashboard/kepsek" element={<SchoolMasterPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["super_admin", "kepala_sekolah"]} requiredPermission="read:teachers" />}>
            <Route element={<AdminDashboardShell />}>
              <Route path="/dashboard/admin/teachers" element={<TeacherManagementPage />} />
              <Route path="/dashboard/kepsek/teachers" element={<TeacherManagementPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["super_admin", "kepala_sekolah"]} requiredPermission="read:students" />}>
            <Route element={<AdminDashboardShell />}>
              <Route path="/dashboard/admin/students" element={<StudentManagementPage />} />
              <Route path="/dashboard/kepsek/students" element={<StudentManagementPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["super_admin", "kepala_sekolah"]} requiredPermission="read:habit_config" />}>
            <Route element={<AdminDashboardShell />}>
              <Route path="/dashboard/admin/habits" element={<HabitConfigurationPage />} />
              <Route path="/dashboard/kepsek/habits" element={<HabitConfigurationPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["super_admin", "kepala_sekolah"]} requiredPermission="read:point_config" />}>
            <Route element={<AdminDashboardShell />}>
              <Route path="/dashboard/admin/points" element={<PointConfigurationPage />} />
              <Route path="/dashboard/kepsek/points" element={<PointConfigurationPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["super_admin", "kepala_sekolah"]} requiredPermission="generate:student_qr" />}>
            <Route element={<AdminDashboardShell />}>
              <Route path="/dashboard/admin/student-accounts" element={<StudentAccountManagementPage />} />
              <Route path="/dashboard/kepsek/student-accounts" element={<StudentAccountManagementPage />} />
            </Route>
          </Route>

          <Route
            element={
              <ProtectedRoute
                allowedRoles={["super_admin", "kepala_sekolah", "wali_kelas"]}
                requiredPermission="read:reports"
              />
            }
          >
            <Route element={<AdminDashboardShell />}>
              <Route path="/dashboard/reports" element={<ReportCenterPage />} />
            </Route>
          </Route>

          <Route
            element={
              <ProtectedRoute
                allowedRoles={["wali_kelas"]}
                requiredPermission="read:student_habits"
              />
            }
          >
            <Route element={<AdminDashboardShell />}>
              <Route path="/dashboard/walikelas" element={<WaliKelasDashboardPage />} />
            </Route>
          </Route>

          <Route
            element={
              <ProtectedRoute
                allowedRoles={["siswa"]}
                requiredPermission="read:own_habits"
              />
            }
          >
            <Route path="/dashboard/siswa" element={<StudentDashboard />} />
            <Route path="/dashboard/siswa/certificate/:certificateId" element={<StudentCertificatePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
