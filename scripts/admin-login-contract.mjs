import { readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");
const login = readFileSync("src/pages/LoginPage.tsx", "utf8");
const admin = readFileSync("src/pages/AdminLoginPage.tsx", "utf8");
const auth = readFileSync("src/services/authService.ts", "utf8");

const checks = [
  ["student login route exists", app.includes('<Route path="/login" element={<LoginPage />} />')],
  ["separate admin login route exists", app.includes('<Route path="/admin/login" element={<AdminLoginPage />} />')],
  ["student page navigates to admin login", login.includes('navigate("/admin/login")')],
  ["student page contains QR flow", login.includes("loginWithQr(qrToken)")],
  ["admin page has username", admin.includes('id="admin-username"')],
  ["admin page has password", admin.includes('id="admin-password"')],
  ["role based redirect", admin.includes("ROLE_REDIRECTS[user.role]")],
  ["mock password validation", auth.includes("credentials.password !== expectedPassword")],
];

for (const [name, ok] of checks) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`PASS: ${name}`);
}
