# ANAKTUMBUH.ID Frontend Regression Test v2.0

## Scope
Regression focused on Super Admin, Kepala Sekolah, Wali Kelas, Siswa Digital, and Siswa Manual guardrails.

## E2E availability
Playwright/Cypress are not installed in this project, so this pass uses a structured static regression checklist plus source-level contract assertions. Browser E2E is not claimed as executed.

## Tests

| ID | Scenario | Result |
|---|---|---|
| REG-01 | Super Admin routes/permissions | PASS by route/permission contract |
| REG-02 | Kepala Sekolah routes/permissions | PASS by route/permission contract |
| REG-03 | Wali Kelas route exists and requires `read:student_habits` | PASS |
| REG-04 | Wali Kelas monitoring only exposes class-scoped monitoring UI | PASS by mock scope contract |
| REG-05 | Wali Kelas comment action requires `write:teacher_notes` | PASS |
| REG-06 | Student Digital route requires `siswa` + `read:own_habits` | PASS |
| REG-07 | Student Manual cannot load/submit Digital habit configuration | PASS |
| REG-08 | Student Manual cannot submit habit through point boundary | PASS |
| REG-09 | Banned manual recap features are absent from student/Wali UI | PASS |
| REG-10 | Report Center exposes role-appropriate report definitions | PASS by mock contract |
| REG-11 | Report read permission is enforced in mock service | PASS |
| REG-12 | Report export permission is enforced in mock service | PASS |
| REG-13 | Ranking remains conditional on feature flag in Student Dashboard | PASS by source contract |
| REG-14 | QR auth route exists | PASS |
| REG-15 | TypeScript lint | BLOCKED by incomplete/corrupt `node_modules` in supplied archive |
| REG-16 | Vite production build | BLOCKED: `vite` binary unavailable in supplied `node_modules` |

## Bugs found and fixed

### BUG-01 — Student Dashboard was not protected
**Severity:** High

`/dashboard/siswa` was publicly routable after login and did not enforce `siswa` + `read:own_habits`.

**Fix:** wrapped the route with `ProtectedRoute`.

### BUG-02 — Wali Kelas login redirected to a missing route
**Severity:** High

Login redirected `walikelas` to `/dashboard/walikelas`, but the route/page was absent from the supplied project.

**Fix:** added `WaliKelasDashboardPage.tsx` and a protected `/dashboard/walikelas` route.

### BUG-03 — Manual student session was not restored correctly
**Severity:** Medium

The mock auth had no Manual student fixture and `getCurrentUser()` fell through to the Digital student for the Manual token.

**Fix:** added `siswa_manual` fixture and explicit `u-5` restoration.

### BUG-04 — Manual guard existed in UI/service but point submission boundary was weaker
**Severity:** High

The mock point submission checked only `role === siswa`, so a Manual student could theoretically call the submission boundary directly.

**Fix:** point submission now requires `method === DIGITAL` and `studentId === user.id`.

### BUG-05 — Report service relied on role but did not enforce read/export permissions
**Severity:** High

The Report Center UI checked permissions, but the mock service itself did not enforce them.

**Fix:** `getReport()` now requires `read:reports` (or `*`), and `exportReport()` requires `export:reports` (or `*`).

## Manual QA checklist

### Super Admin
- [x] Can authenticate through mock login.
- [x] Wildcard permission remains available.
- [x] School/student/config/report routes are not blocked by permission guard.

### Kepala Sekolah
- [x] School/admin routes require school permission.
- [x] Student, habit, point, QR account, and report routes have role + permission guards.
- [x] No Manual recap feature added.

### Wali Kelas
- [x] `/dashboard/walikelas` is role-protected.
- [x] Monitoring UI is class-focused.
- [x] Digital/Manual status is visible.
- [x] Manual student shows no digital input or manual recap action.
- [x] Comment action is permission guarded.
- [x] Export is permission guarded.

### Siswa Digital
- [x] Student dashboard route requires student role and own-habits permission.
- [x] Digital habit form is available through the existing dynamic configuration service.
- [x] Submit/locked state remains present.
- [x] Poin/EXP/Level are treated as backend response values.
- [x] Ranking remains conditional on backend feature flag.

### Siswa Manual
- [x] Manual fixture is available for regression login.
- [x] Manual session restores as `method=MANUAL`.
- [x] Digital habit configuration is rejected.
- [x] Digital habit submission is rejected.
- [x] Point submission boundary rejects Manual.
- [x] No Input Rekap Manual, Isi Massal, Salin Hari Sebelumnya, or Import Rekap Buku UI was introduced.

## Build/test environment limitation
The supplied archive contains an incomplete `node_modules` tree. `npm run lint` fails before project type-checking with missing `@types/*` entries, and `npm run build` cannot find the Vite binary. Playwright/Cypress are also not installed. These are environment/package-state blockers, not acceptance passes.

Recommended local verification:

```bash
npm install
npm run lint
npm run build
```
Then add/run browser E2E in CI once the project has a configured E2E runner.
