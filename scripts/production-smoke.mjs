import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const app = read("src/App.tsx");
const auth = read("src/services/authService.ts");
const submission = read("src/services/habitSubmissionService.ts");
const points = read("src/services/pointConfigurationService.ts");
const reports = read("src/services/reportService.ts");
const envExample = read(".env.example");
const vercel = read("vercel.json");

assert.match(app, /path="\/auth\/qr"/, "QR auth route must exist");
assert.match(app, /path="\/dashboard\/siswa"/, "Student dashboard route must exist");
assert.match(app, /allowedRoles=\{\["siswa"\]\}/, "Student dashboard must be role protected");
assert.match(app, /path="\/dashboard\/walikelas"/, "Wali Kelas dashboard route must exist");
assert.match(app, /allowedRoles=\{\["wali_kelas"\]\}/, "Wali Kelas dashboard must be role protected");
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
  for (const route of ["/login", "/auth/qr", "/dashboard/siswa", "/dashboard/walikelas", "/dashboard/reports"]) {
    const response = await fetch(`${base}${route}`, { redirect: "manual" });
    if (response.status >= 500) throw new Error(`${route} returned HTTP ${response.status}`);
    console.log(`HTTP smoke ${route}: ${response.status}`);
  }
}
