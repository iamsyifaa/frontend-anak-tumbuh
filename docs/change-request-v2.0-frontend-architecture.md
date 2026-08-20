# Change Request — Frontend Architecture Baseline

## CR-AT-001 — Repository implementation differs from Structure Project v2.0

### Source of conflict
The Structure Project v2.0 specifies a frontend based on Next.js + JavaScript + Tailwind CSS, with Laravel as the backend/API and Supabase/PostgreSQL as the data layer. The supplied ZIP currently contains a React + Vite + TypeScript frontend with mock service boundaries and no Laravel backend in the archive.

The v2.0 project document states that frontend authorization is not the security boundary and that Laravel owns business logic/authorization.

### Decision for this slice
Do **not** silently migrate the repository to Next.js or invent a Laravel API contract while building the Super Admin dashboard. The Super Admin dashboard is implemented inside the existing React/Vite structure as a frontend slice, with the dashboard aggregation isolated behind `superAdminDashboardService`.

### Required follow-up
Before production integration, align the repository with the agreed Next.js + Laravel + Supabase architecture and replace mock service implementations with the finalized backend API boundaries. This change should be handled as a separate migration/change request so existing routes and behavior are not changed implicitly.

## CR-AT-002 — Conditional Indicator UI removed from school configuration

### Source of conflict
Requirement/ERD v2.0 supports conditional/dependent indicators via `indicator_conditions`.

### Decision for this slice
Remove the configuration UI from Super Admin and Kepala Sekolah because the latest product decision explicitly cancels the school-facing setup screen. The underlying model/service boundary is retained so the repository remains compatible with the v2.0 data model and future backend responses.

## CR-AT-003 — Certificate distribution delegated to Wali Kelas

### Source of conflict
Role & Permission v2.0 gives Super Admin and Kepala Sekolah certificate management/generation and gives students access to their own certificates. The latest product decision changes distribution so Wali Kelas downloads the issued certificate for printing and handover to the student.

### Decision for this slice
Certificates are issued by Super Admin/Kepala Sekolah with a Wali Kelas recipient scope. The student dashboard has no certificate entry point. Wali Kelas can view, preview, download, and print issued certificates within the single rombel scope.

## CR-AT-004 — Graduation flow added to student placement

### Source of conflict
The baseline defines `graduated` as a retained historical status, but does not specify the exact frontend action flow for bulk graduation from a rombel.

### Decision for this slice
Add a `Lulus / Arsip` action that selects a source rombel, marks active students as `graduated`, preserves enrollment history, and revokes their QR credential. This remains mock-service behavior until the Laravel endpoint is finalized.
