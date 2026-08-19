import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { SuperAdminDashboardShell } from "../layouts/SuperAdminDashboardShell";
import { SuperAdminDashboardPage } from "../pages/SuperAdminDashboardPage";
import { SchoolMasterPage } from "../pages/SchoolMasterPage";
import { TeacherManagementPage } from "../pages/TeacherManagementPage";
import { StudentManagementPage } from "../pages/StudentManagementPage";
import { StudentAccountManagementPage } from "../pages/StudentAccountManagementPage";
import { HabitConfigurationPage } from "../pages/HabitConfigurationPage";
import { PointConfigurationPage } from "../pages/PointConfigurationPage";
import { ReportCenterPage } from "../pages/ReportCenterPage";

export const SuperAdminRoutes: React.FC = () => (
  <Routes>
    <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
      <Route element={<SuperAdminDashboardShell />}>
        <Route index element={<Navigate to="/dashboard/admin" replace />} />
        <Route path="/dashboard/admin" element={<SuperAdminDashboardPage />} />
        <Route path="/dashboard/admin/schools" element={<ProtectedRoute requiredPermission="read:school_master" />}><Route index element={<SchoolMasterPage />} /></Route>
        <Route path="/dashboard/admin/teachers" element={<ProtectedRoute requiredPermission="read:teachers" />}><Route index element={<TeacherManagementPage />} /></Route>
        <Route path="/dashboard/admin/students" element={<ProtectedRoute requiredPermission="read:students" />}><Route index element={<StudentManagementPage />} /></Route>
        <Route path="/dashboard/admin/student-accounts" element={<ProtectedRoute requiredPermission="generate:student_qr" />}><Route index element={<StudentAccountManagementPage />} /></Route>
        <Route path="/dashboard/admin/habits" element={<ProtectedRoute requiredPermission="read:habit_config" />}><Route index element={<HabitConfigurationPage />} /></Route>
        <Route path="/dashboard/admin/points" element={<ProtectedRoute requiredPermission="read:point_config" />}><Route index element={<PointConfigurationPage />} /></Route>
        <Route path="/dashboard/admin/reports" element={<ProtectedRoute requiredPermission="read:reports" />}><Route index element={<ReportCenterPage />} /></Route>
      </Route>
    </Route>
  </Routes>
);
