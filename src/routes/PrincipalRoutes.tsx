import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { PrincipalDashboardShell } from "../layouts/PrincipalDashboardShell";
import { PrincipalDashboardPage } from "../pages/PrincipalDashboardPage";
import { SchoolMasterPage } from "../pages/SchoolMasterPage";
import { TeacherManagementPage } from "../pages/TeacherManagementPage";
import { StudentManagementPage } from "../pages/StudentManagementPage";
import { StudentAccountManagementPage } from "../pages/StudentAccountManagementPage";
import { HabitConfigurationPage } from "../pages/HabitConfigurationPage";
import { PointConfigurationPage } from "../pages/PointConfigurationPage";
import { ReportCenterPage } from "../pages/ReportCenterPage";

export const PrincipalRoutes: React.FC = () => (
  <Routes>
    <Route element={<ProtectedRoute allowedRoles={["kepala_sekolah"]} />}>
      <Route element={<PrincipalDashboardShell />}>
        <Route index element={<Navigate to="/dashboard/kepsek" replace />} />
        <Route path="/dashboard/kepsek" element={<PrincipalDashboardPage />} />
        <Route path="/dashboard/kepsek/schools" element={<ProtectedRoute requiredPermission="read:school_master" />}><Route index element={<SchoolMasterPage />} /></Route>
        <Route path="/dashboard/kepsek/teachers" element={<ProtectedRoute requiredPermission="read:teachers" />}><Route index element={<TeacherManagementPage />} /></Route>
        <Route path="/dashboard/kepsek/students" element={<ProtectedRoute requiredPermission="read:students" />}><Route index element={<StudentManagementPage />} /></Route>
        <Route path="/dashboard/kepsek/student-accounts" element={<ProtectedRoute requiredPermission="generate:student_qr" />}><Route index element={<StudentAccountManagementPage />} /></Route>
        <Route path="/dashboard/kepsek/habits" element={<ProtectedRoute requiredPermission="read:habit_config" />}><Route index element={<HabitConfigurationPage />} /></Route>
        <Route path="/dashboard/kepsek/points" element={<ProtectedRoute requiredPermission="read:point_config" />}><Route index element={<PointConfigurationPage />} /></Route>
        <Route path="/dashboard/kepsek/reports" element={<ProtectedRoute requiredPermission="read:reports" />}><Route index element={<ReportCenterPage />} /></Route>
      </Route>
    </Route>
  </Routes>
);
