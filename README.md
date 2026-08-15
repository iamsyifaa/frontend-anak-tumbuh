<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b338d80d-3c6a-45da-9082-0ecef64a9ad4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Student Management & Excel Import Wizard

Added in the v2.0 student-management slice:

- `/dashboard/admin/students` for Super Admin
- `/dashboard/kepsek/students` for Kepala Sekolah
- Student master list with school scope, filters, DIGITAL/MANUAL badges, status and QR actions
- Add Student form with validation
- Excel/CSV import wizard: Upload → Preview → Errors → Commit
- Mock API boundary in `src/services/studentService.ts`
- Browser-side `.xlsx`/`.csv` parsing in `src/services/excelImport.ts`
- Import validation for required identity, duplicate NISN/NIS, DIGITAL/MANUAL method, and school/year/rombel scope
- Manual students remain master data only; no manual recap input, mass recap, copy-previous, or manual-book answer import is included.

The final API endpoint names remain intentionally uncommitted because the v2.0 documents lock the domain/boundary and authorization rules, not final endpoint names.
