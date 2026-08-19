import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const app = read("src/App.tsx");
const superAdminRoutes = read("src/routes/SuperAdminRoutes.tsx");
const principalRoutes = read("src/routes/PrincipalRoutes.tsx");
const superAdminShell = read("src/layouts/SuperAdminDashboardShell.tsx");
const principalShell = read("src/layouts/PrincipalDashboardShell.tsx");
const auth = read("src/services/authService.ts");
const submission = read("src/services/habitSubmissionService.ts");
const points = read("src/services/pointConfigurationService.ts");
const reports = read("src/services/reportService.ts");
const adminDashboard = read("src/pages/SuperAdminDashboardPage.tsx");
const adminDashboardService = read("src/services/superAdminDashboardService.ts");
const envExample = read(".env.example");
const vercel = read("vercel.json");

assert.match(app, /path="\/auth\/qr"/, "QR auth route must exist");
assert.match(app, /path="\/dashboard\/siswa"/, "Student dashboard route must exist");
assert.match(app, /allowedRoles=\{\["siswa"\]\}/, "Student dashboard must be role protected");
assert.match(app, /SuperAdminRoutes/, "App must mount Super Admin route boundary");
assert.match(app, /PrincipalRoutes/, "App must mount Principal route boundary");
assert.match(superAdminRoutes, /path="\/dashboard\/admin"/, "Super Admin dashboard route must exist in its boundary");
assert.match(superAdminRoutes, /allowedRoles=\{\["super_admin"\]\}/, "Super Admin route boundary must be role protected");
assert.match(principalRoutes, /path="\/dashboard\/kepsek"/, "Principal dashboard route must exist in its boundary");
assert.match(principalRoutes, /allowedRoles=\{\["kepala_sekolah"\]\}/, "Principal route boundary must be role protected");
assert.ok(superAdminShell.includes("bg-[#0b1b3a]"), "Super Admin shell must use isolated navy sidebar");
assert.ok(principalShell.includes("bg-[#0b1b3a]"), "Principal shell must use isolated navy sidebar");
assert.match(superAdminShell, /\/dashboard\/admin\/reports/, "Super Admin shell must use its own report route");
assert.match(principalShell, /\/dashboard\/kepsek\/reports/, "Principal shell must use its own report route");
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
