import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const app = read('src/App.tsx');
const auth = read('src/services/authService.ts');
const submission = read('src/services/habitSubmissionService.ts');
const points = read('src/services/pointConfigurationService.ts');
const report = read('src/services/reportService.ts');
const manualForm = read('src/components/views/IsiKebiasaanView.tsx');
const wali = read('src/pages/WaliKelasDashboardPage.tsx');
const waliService = read('src/services/classMonitoringService.ts');

assert.match(app, /allowedRoles=\{\["siswa"\]\}/, 'Student dashboard must be role protected');
assert.match(app, /requiredPermission="read:own_habits"/, 'Student dashboard must require own-habits permission');
assert.match(app, /WaliKelasRoute/, 'Wali Kelas dashboard route must exist');

assert.match(app, /path="\/dashboard\/admin" element={<SuperAdminDashboardPage \/>}/, 'Super Admin dashboard route must exist');
assert.match(app, /path="\/dashboard\/kepsek" element={<PrincipalDashboardPage \/>}/, 'Kepala Sekolah must use PrincipalDashboardPage');
assert.match(app, /path="\/dashboard\/kepsek\/schools" element={<SchoolMasterPage \/>}/, 'Kepala Sekolah school structure route must exist');
assert.match(app, /path="\/dashboard\/admin\/teachers" element={<TeacherManagementPage \/>}/, 'Super Admin teacher route must exist');
assert.match(app, /path="\/dashboard\/kepsek\/teachers" element={<TeacherManagementPage \/>}/, 'Kepala Sekolah teacher route must exist');
assert.match(app, /path="\/dashboard\/reports" element={<ReportCenterPage \/>}/, 'Report Center route must exist');
assert.match(app, /WaliKelasRoute/, 'Wali Kelas route must be isolated in its own route module');
assert.match(auth, /"read:reports"/, 'Role fixtures must include report permission where applicable');
assert.match(auth, /"export:reports"/, 'Role fixtures must include report export permission where applicable');

assert.match(auth, /siswa_manual/, 'Manual student regression fixture must exist');
assert.match(auth, /token\.includes\("u-5"\)/, 'Manual student session must restore correctly');
assert.match(submission, /user\.method !== "DIGITAL"/, 'Habit submission service must reject Manual students');
assert.match(points, /user\.method !== "DIGITAL"/, 'Point submission boundary must reject Manual students');
assert.match(manualForm, /Pengisian digital tidak tersedia/, 'Manual UI must not expose digital form');
assert.doesNotMatch(manualForm, /Input Rekap Manual|Isi Massal|Salin Hari Sebelumnya|Import Rekap Buku/, 'Manual recap features must not exist');
assert.match(report, /read:reports/, 'Report API mock must enforce read permission');
assert.match(report, /export:reports/, 'Report export API mock must enforce export permission');
assert.match(waliService, /write:teacher_notes/, 'Wali Kelas comment action must be permission guarded');
assert.doesNotMatch(wali, /Input Rekap Manual|Isi Massal|Salin Hari Sebelumnya|Import Rekap Buku/, 'Wali dashboard must not expose banned manual recap features');
console.log('REGRESSION STATIC CHECK: PASS');

const waliRoutes = read('src/routes/WaliKelasRoutes.tsx');
const waliShell = read('src/layouts/WaliKelasDashboardShell.tsx');
assert.match(waliRoutes, /allowedRoles=\{\["wali_kelas"\]\}/, 'Wali Kelas route must be role protected');
assert.match(waliRoutes, /requiredPermission="read:student_habits"/, 'Wali Kelas route must require student-habits permission');
assert.match(waliRoutes, /path="\/dashboard\/walikelas"/, 'Wali Kelas route path must exist in isolated module');
assert.match(waliRoutes, /WaliKelasDashboardShell/, 'Wali Kelas route must use isolated shell');
assert.doesNotMatch(waliRoutes, /AdminDashboardShell/, 'Wali Kelas route must not depend on AdminDashboardShell');
assert.doesNotMatch(waliShell, /AdminDashboardShell/, 'Wali Kelas shell must not depend on AdminDashboardShell');
