import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { QrAuthHandlerPage } from "./pages/QrAuthHandlerPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { StudentCertificatePage } from "./pages/StudentCertificatePage";

import { SuperAdminDashboardShell } from "./layouts/SuperAdminDashboardShell";
import { PrincipalDashboardShell } from "./layouts/PrincipalDashboardShell";
import { WaliKelasDashboardShell } from "./layouts/WaliKelasDashboardShell";

import { SuperAdminDashboardPage } from "./pages/SuperAdminDashboardPage";
import { PrincipalDashboardPage } from "./pages/PrincipalDashboardPage";
import { WaliKelasDashboardPage } from "./pages/WaliKelasDashboardPage";
import { SchoolMasterPage } from "./pages/SchoolMasterPage";
import { TeacherManagementPage } from "./pages/TeacherManagementPage";
import { StudentManagementPage } from "./pages/StudentManagementPage";
import { StudentAccountManagementPage } from "./pages/StudentAccountManagementPage";
import { HabitConfigurationPage } from "./pages/HabitConfigurationPage";
import { PointConfigurationPage } from "./pages/PointConfigurationPage";
import { ReportCenterPage } from "./pages/ReportCenterPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public/auth pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/auth/qr" element={<QrAuthHandlerPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* =========================
              SUPER ADMIN — ISOLATED
             ========================= */}
          <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
            <Route element={<SuperAdminDashboardShell />}>
              <Route path="/dashboard/admin" element={<SuperAdminDashboardPage />} />

              <Route element={<ProtectedRoute requiredPermission="read:school_master" />}>
                <Route path="/dashboard/admin/schools" element={<SchoolMasterPage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="read:teachers" />}>
                <Route path="/dashboard/admin/teachers" element={<TeacherManagementPage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="read:students" />}>
                <Route path="/dashboard/admin/students" element={<StudentManagementPage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="generate:student_qr" />}>
                <Route path="/dashboard/admin/student-accounts" element={<StudentAccountManagementPage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="read:habit_config" />}>
                <Route path="/dashboard/admin/habits" element={<HabitConfigurationPage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="read:point_config" />}>
                <Route path="/dashboard/admin/points" element={<PointConfigurationPage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="read:reports" />}>
                <Route path="/dashboard/admin/reports" element={<ReportCenterPage />} />
              </Route>
            </Route>
          </Route>

          {/* =========================
              KEPALA SEKOLAH — ISOLATED
             ========================= */}
          <Route element={<ProtectedRoute allowedRoles={["kepala_sekolah"]} />}>
            <Route element={<PrincipalDashboardShell />}>
              <Route path="/dashboard/kepsek" element={<PrincipalDashboardPage />} />

              <Route element={<ProtectedRoute requiredPermission="read:school_master" />}>
                <Route path="/dashboard/kepsek/schools" element={<SchoolMasterPage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="read:teachers" />}>
                <Route path="/dashboard/kepsek/teachers" element={<TeacherManagementPage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="read:students" />}>
                <Route path="/dashboard/kepsek/students" element={<StudentManagementPage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="generate:student_qr" />}>
                <Route path="/dashboard/kepsek/student-accounts" element={<StudentAccountManagementPage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="read:habit_config" />}>
                <Route path="/dashboard/kepsek/habits" element={<HabitConfigurationPage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="read:point_config" />}>
                <Route path="/dashboard/kepsek/points" element={<PointConfigurationPage />} />
              </Route>
              <Route element={<ProtectedRoute requiredPermission="read:reports" />}>
                <Route path="/dashboard/kepsek/reports" element={<ReportCenterPage />} />
              </Route>
            </Route>
          </Route>

          {/* =========================
              WALI KELAS — ISOLATED
             ========================= */}
          <Route element={<ProtectedRoute allowedRoles={["wali_kelas"]} requiredPermission="read:student_habits" />}>
            <Route element={<WaliKelasDashboardShell />}>
              <Route path="/dashboard/walikelas" element={<WaliKelasDashboardPage />} />
              <Route path="/dashboard/wali-kelas" element={<WaliKelasDashboardPage />} />
              <Route element={<ProtectedRoute requiredPermission="read:reports" />}>
                <Route path="/dashboard/walikelas/reports" element={<ReportCenterPage variant="wali_kelas" />} />
                <Route path="/dashboard/wali-kelas/reports" element={<ReportCenterPage variant="wali_kelas" />} />
              </Route>
            </Route>
          </Route>

          {/* Student area remains independent from the role dashboards. */}
          <Route element={<ProtectedRoute allowedRoles={["siswa"]} requiredPermission="read:own_habits" />}>
            <Route path="/dashboard/siswa" element={<StudentDashboard />} />
            <Route path="/dashboard/siswa/certificate/:certificateId" element={<StudentCertificatePage />} />
          </Route>

          {/* Unknown dashboard path: return to the role login instead of rendering a blank page. */}
          <Route path="/dashboard" element={<Navigate to="/admin/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
