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

assert.match(app, /allowedRoles=\{\["siswa"\]\}/, 'Student dashboard must be role protected');
assert.match(app, /requiredPermission="read:own_habits"/, 'Student dashboard must require own-habits permission');
assert.match(app, /path="\/dashboard\/walikelas"/, 'Wali Kelas dashboard route must exist');
assert.match(app, /allowedRoles=\{\["wali_kelas"\]\}/, 'Wali Kelas dashboard must be role protected');
assert.match(app, /requiredPermission="read:student_habits"/, 'Wali Kelas dashboard must require student-habits permission');
assert.match(auth, /siswa_manual/, 'Manual student regression fixture must exist');
assert.match(auth, /token\.includes\("u-5"\)/, 'Manual student session must restore correctly');
assert.match(submission, /user\.method !== "DIGITAL"/, 'Habit submission service must reject Manual students');
assert.match(points, /user\.method !== "DIGITAL"/, 'Point submission boundary must reject Manual students');
assert.match(manualForm, /Pengisian digital tidak tersedia/, 'Manual UI must not expose digital form');
assert.doesNotMatch(manualForm, /Input Rekap Manual|Isi Massal|Salin Hari Sebelumnya|Import Rekap Buku/, 'Manual recap features must not exist');
assert.match(report, /read:reports/, 'Report API mock must enforce read permission');
assert.match(report, /export:reports/, 'Report export API mock must enforce export permission');
assert.match(wali, /write:teacher_notes/, 'Wali Kelas comment action must be permission guarded');
assert.doesNotMatch(wali, /Input Rekap Manual|Isi Massal|Salin Hari Sebelumnya|Import Rekap Buku/, 'Wali dashboard must not expose banned manual recap features');
console.log('REGRESSION STATIC CHECK: PASS');
