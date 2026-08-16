# ANAKTUMBUH.ID — Production Readiness & Smoke Test v2.0

## Production environment
- `VITE_API_BASE_URL`: public Laravel API base URL; never commit a secret.
- `VITE_USE_MOCK_API=true`: local/mock development only.
- `VITE_USE_MOCK_API=false`: production mode after backend API integration is available.
- Do not expose private API keys, passwords, service-role keys, or QR credentials through `VITE_*` variables.

## Deployment
Vercel SPA fallback is configured in `vercel.json`, including deep links such as `/auth/qr`.

## Smoke routes
- `/login`
- `/auth/qr`
- `/dashboard/siswa`
- `/dashboard/walikelas`
- `/dashboard/reports`

## Role smoke checklist
### Super Admin
- Login succeeds.
- School/master administration is accessible only within its permissions.
- Cross-school scope remains backend-controlled.

### Kepala Sekolah
- Login succeeds.
- School dashboard/master is scoped to the school.
- Student management/report access follows permissions.
- No Manual book recap flow is exposed.

### Wali Kelas
- Login succeeds.
- Only the assigned rombel is visible.
- Student Digital/Manual status is visible.
- Monitoring/comment/report access follows permission.
- No Input Rekap Manual, Isi Massal, Salin Hari Sebelumnya, or Import Rekap Buku exists.

### Siswa Digital
- Login/QR handoff succeeds.
- Daily habit form is available.
- Submission locks after success.
- Official Poin/EXP/Level/Streak values are rendered from backend response.

### Siswa Manual
- Login succeeds.
- Digital habit form is unavailable.
- No teacher manual recap workflow exists.

## Known production blocker
The current project still contains mock service implementations because final Laravel endpoint contracts were not supplied/locked. Production should set `VITE_USE_MOCK_API=false` only after those services are replaced with backend API calls and backend authorization is verified.

## Validation
Run:
```bash
npm ci
npm run lint
npm run build
node scripts/production-smoke.mjs
```
Optional deployed smoke:
```bash
SMOKE_URL=https://your-vercel-domain.example node scripts/production-smoke.mjs
```
