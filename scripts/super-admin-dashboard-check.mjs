import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync("src/App.tsx", "utf8");
const page = fs.readFileSync("src/pages/SuperAdminDashboardPage.tsx", "utf8");
const service = fs.readFileSync("src/services/superAdminDashboardService.ts", "utf8");

assert.match(app, /path="\/dashboard\/admin" element={<SuperAdminDashboardPage \/>}/);
assert.match(app, /path="\/dashboard\/admin\/schools" element={<SchoolMasterPage \/>}/);
assert.match(page, /user\?\.role !== "super_admin"/);
assert.match(service, /user\.role !== "super_admin"/);
assert.match(page, /Siswa Manual tetap menjadi data siswa/);
assert.doesNotMatch(page, /Input Rekap Manual|Isi Massal|Salin Data Hari Sebelumnya|Import Rekap Buku/);
assert.match(service, /student\.method === "DIGITAL"/);
assert.match(service, /student\.method === "MANUAL"/);

console.log("Super Admin dashboard contract checks: PASS");
