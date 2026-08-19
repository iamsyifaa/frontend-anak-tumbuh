import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const app = read("src/App.tsx");
const superAdminShell = read("src/layouts/SuperAdminDashboardShell.tsx");
const principalShell = read("src/layouts/PrincipalDashboardShell.tsx");
const auth = read("src/services/authService.ts");
const submission = read("src/services/habitSubmissionService.ts");
const points = read("src/services/pointConfigurationService.ts");
const reports = read("src/services/reportService.ts");
const reportPage = read("src/pages/ReportCenterPage.tsx");
const certificatePage = read("src/pages/CertificateManagementPage.tsx");
const certificateService = read("src/services/certificateService.ts");
const qrPage = read("src/pages/StudentAccountManagementPage.tsx");
const qrTypes = read("src/types/studentAccount.ts");
const studentHabitPage = read("src/components/views/IsiKebiasaanView.tsx");
const conditionBuilder = read("src/components/habits/ConditionBuilder.tsx");
const pencapaian = read("src/components/views/PencapaianView.tsx");
const studentAggregate = read("src/components/dashboard/StudentDashboardAggregate.tsx");
const adminDashboard = read("src/pages/SuperAdminDashboardPage.tsx");
const adminDashboardService = read("src/services/superAdminDashboardService.ts");
const envExample = read(".env.example");
const vercel = read("vercel.json");

assert.match(app, /path="\/auth\/qr"/, "QR auth route must exist");
assert.match(app, /path="\/dashboard\/siswa"/, "Student dashboard route must exist");
assert.match(app, /allowedRoles=\{\["siswa"\]\}/, "Student dashboard must be role protected");
assert.doesNotMatch(superAdminShell, /Report Center|\/dashboard\/admin\/reports/, "Super Admin must not expose Report Center");
assert.match(principalShell, /\/dashboard\/kepsek\/reports/, "Principal shell must use its own report route");
assert.match(app, /\/dashboard\/admin\/certificates/, "Super Admin certificate route must exist");
assert.match(app, /\/dashboard\/kepsek\/certificates/, "Principal certificate route must exist");
assert.match(certificateService, /manage:certificates/, "Certificate management permission must be enforced");
assert.match(certificatePage, /Buat & berikan/, "Certificate management must support issuance");
assert.doesNotMatch(studentAggregate, /Sertifikat/, "Student Beranda must not expose certificate summary");
assert.doesNotMatch(pencapaian, /Sertifikat|certificate/, "Student Pencapaian must not expose certificates");
assert.doesNotMatch(app, /dashboard\/siswa\/certificate/, "Student certificate route must be removed");
assert.match(studentHabitPage, /Isi dengan jujur/, "Daily habit honesty warning must be visible");
assert.match(reports, /id: "habit"/, "Habit report type must exist");
assert.match(reports, /id: "initiative"/, "Initiative report type must exist");
assert.match(reportPage, /Per Kebiasaan/, "Report Center must expose habit report option");
assert.match(reportPage, /Per Inisiatif/, "Report Center must expose initiative report option");
assert.match(reportPage, /user\?\.role === "kepala_sekolah"/, "Class filter must be Principal-only");
assert.match(qrPage, /Download PNG/, "QR management must offer PNG download");
assert.match(qrPage, /Semua angkatan/, "QR download must support cohort filter");
assert.match(qrPage, /Semua kelas/, "QR download must support class filter");
assert.match(qrPage, /Semua rombel/, "QR download must support rombel filter");
assert.match(qrTypes, /academicYearId\?: string;/, "QR credential must preserve academic year metadata");
assert.match(conditionBuilder, /Jika jawabannya berbeda, indikator target disembunyikan/, "Conditional rule behavior must be explicit in UI");
assert.match(adminDashboard, /SUPER_ADMIN_DASHBOARD_PERMISSIONS/);
assert.match(adminDashboardService, /role !== "super_admin"/, "Dashboard service must enforce Super Admin role");
assert.match(app, /allowedRoles=\{\["wali_kelas"\]\}/, "Wali Kelas dashboard must be role protected");
assert.match(app, /path="\/dashboard\/walikelas"/, "Wali Kelas dashboard route must exist");
assert.match(auth, /siswa_manual/, "Manual student fixture must exist");
assert.match(submission, /method !== "DIGITAL"/, "Manual student must be rejected by submission boundary");
assert.match(points, /method !== "DIGITAL"/, "Manual student must be rejected by scoring/submission boundary");
assert.match(reports, /read:reports/, "Report read permission must be enforced");
assert.match(reports, /export:reports/, "Report export permission must be enforced");
assert.doesNotMatch(auth, /https?:\/\/(?:localhost|127\.0\.0\.1)/i, "Auth service must not hardcode local URLs");
assert.doesNotMatch(envExample, /AIza[0-9A-Za-z_-]{20,}/, "No real Google API key may be committed");
assert.match(envExample, /VITE_API_BASE_URL/, "Production API base URL must be environment driven");
assert.match(envExample, /VITE_USE_MOCK_API/, "Mock API mode must be explicitly configurable");
const rewrite = JSON.parse(vercel);
assert.ok(Array.isArray(rewrite.rewrites), "Vercel SPA rewrites must exist");
console.log("PRODUCTION SMOKE STATIC CHECK: PASS");

const smokeUrl = process.env.SMOKE_URL;
if (smokeUrl) {
  const base = smokeUrl.replace(/\/$/, "");
  for (const route of ["/login", "/auth/qr", "/dashboard/siswa", "/dashboard/admin", "/dashboard/kepsek", "/dashboard/walikelas"]) {
    const response = await fetch(`${base}${route}`, { redirect: "manual" });
    if (response.status >= 500) throw new Error(`${route} returned HTTP ${response.status}`);
    console.log(`HTTP smoke ${route}: ${response.status}`);
  }
}
