import React from "react";
import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { WaliKelasDashboardShell } from "../layouts/WaliKelasDashboardShell";
import { WaliKelasDashboardPage } from "../pages/WaliKelasDashboardPage";
import { ReportCenterPage } from "../pages/ReportCenterPage";
import { WaliKelasCertificatePage } from "../pages/WaliKelasCertificatePage";

export const WaliKelasRoutes: React.FC = () => (
  <Routes>
    <Route element={<ProtectedRoute allowedRoles={["wali_kelas"]} requiredPermission="read:student_habits" />}>
      <Route element={<WaliKelasDashboardShell />}>
        <Route path="/dashboard/walikelas" element={<WaliKelasDashboardPage />} />
        <Route path="/dashboard/wali-kelas" element={<WaliKelasDashboardPage />} />
        <Route path="/dashboard/walikelas/reports" element={<ReportCenterPage variant="wali_kelas" />} />
        <Route path="/dashboard/walikelas/certificates" element={<WaliKelasCertificatePage />} />
        <Route path="/dashboard/wali-kelas/reports" element={<ReportCenterPage variant="wali_kelas" />} />
        <Route path="/dashboard/wali-kelas/certificates" element={<WaliKelasCertificatePage />} />
      </Route>
    </Route>
  </Routes>
);
