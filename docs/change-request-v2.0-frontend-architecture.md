# Change Request — Frontend Architecture Baseline

## CR-AT-001 — Repository implementation differs from Structure Project v2.0

### Source of conflict
The Structure Project v2.0 specifies a frontend based on Next.js + JavaScript + Tailwind CSS, with Laravel as the backend/API and Supabase/PostgreSQL as the data layer. The supplied ZIP currently contains a React + Vite + TypeScript frontend with mock service boundaries and no Laravel backend in the archive.

The v2.0 project document states that frontend authorization is not the security boundary and that Laravel owns business logic/authorization.

### Decision for this slice
Do **not** silently migrate the repository to Next.js or invent a Laravel API contract while building the Super Admin dashboard. The Super Admin dashboard is implemented inside the existing React/Vite structure as a frontend slice, with the dashboard aggregation isolated behind `superAdminDashboardService`.

### Required follow-up
Before production integration, align the repository with the agreed Next.js + Laravel + Supabase architecture and replace mock service implementations with the finalized backend API boundaries. This change should be handled as a separate migration/change request so existing routes and behavior are not changed implicitly.
