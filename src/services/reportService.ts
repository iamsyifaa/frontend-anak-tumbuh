import { UserProfile } from "../types/auth";
import { ReportContext, ReportDefinition, ReportFilter, ReportResult, ReportRow, ReportScope, ReportColumn, InitiativeReportValue } from "../types/report";

const REPORTS: ReportDefinition[] = [
  { id: "student", title: "Laporan Siswa", description: "Rekap perkembangan siswa dalam periode terpilih.", allowedRoles: ["kepala_sekolah", "wali_kelas"], exportFormats: ["csv", "pdf"] },
  { id: "class", title: "Laporan Rombel / Kelas", description: "Rekap satu rombel atau kelas dalam scope sekolah.", allowedRoles: ["kepala_sekolah"], exportFormats: ["csv", "pdf"] },
  { id: "achievement", title: "Laporan Pencapaian", description: "Rekap badge, penghargaan, dan sertifikat yang tercatat.", allowedRoles: ["kepala_sekolah", "wali_kelas"], exportFormats: ["csv", "pdf"] },
  { id: "habit", title: "Laporan Per Kebiasaan", description: "Rekap satu dari tujuh kebiasaan, termasuk deskripsi isian dan inisiatif.", allowedRoles: ["kepala_sekolah", "wali_kelas"], exportFormats: ["csv", "pdf"] },
];

const HABITS = [
  { id: "habit-1", name: "Bangun Pagi" },
  { id: "habit-2", name: "Beribadah" },
  { id: "habit-3", name: "Berolahraga" },
  { id: "habit-4", name: "Makan Sehat dan Bergizi" },
  { id: "habit-5", name: "Gemar Belajar" },
  { id: "habit-6", name: "Bermasyarakat" },
  { id: "habit-7", name: "Tidur Cepat" },
];

const MOCK_ROWS: (ReportRow & { academicYearId: string; classId: string })[] = [
  { id: "stu-001", studentName: "Ahmad Rizky", nis: "10001", className: "5A • Cendekia", method: "DIGITAL", activityPercent: 92, points: 1450, exp: 820, level: 6, streak: 12, badges: 4, awards: 2, completedDays: 6, academicYearId: "ay-2026", classId: "cls-5a", initiative: "Sadar sendiri" },
  { id: "stu-002", studentName: "Alya Putri", nis: "10002", className: "5A • Cendekia", method: "DIGITAL", activityPercent: 84, points: 1280, exp: 740, level: 5, streak: 8, badges: 3, awards: 1, completedDays: 5, academicYearId: "ay-2026", classId: "cls-5a", initiative: "Disuruh" },
  { id: "stu-003", studentName: "Bima Pratama", nis: "10003", className: "5A • Cendekia", method: "MANUAL", activityPercent: null, points: null, exp: null, level: null, streak: null, badges: 0, awards: 0, completedDays: null, academicYearId: "ay-2026", classId: "cls-5a", initiative: null },
  { id: "stu-004", studentName: "Citra Lestari", nis: "10004", className: "8B • Inspiratif", method: "DIGITAL", activityPercent: 76, points: 1040, exp: 610, level: 4, streak: 5, badges: 2, awards: 1, completedDays: 4, academicYearId: "ay-2026", classId: "cls-8b", initiative: "Sadar sendiri" },
];

const HABIT_DESCRIPTIONS: Record<string, string> = {
  "habit-1": "Bangun pukul 05.00",
  "habit-2": "Menjalankan ibadah wajib sesuai kebiasaan sekolah",
  "habit-3": "Berolahraga 30 menit",
  "habit-4": "Sarapan cukup sebelum beraktivitas",
  "habit-5": "Belajar selama 45 menit",
  "habit-6": "Membantu orang tua merapikan rumah",
  "habit-7": "Tidur pukul 20.30",
};

function getAllowedDefinitions(user: UserProfile) {
  return REPORTS.filter((report) => report.allowedRoles.includes(user.role));
}

function applyScope(user: UserProfile, filter: ReportFilter) {
  let rows = [...MOCK_ROWS];
  if (user.role === "wali_kelas") rows = rows.filter((row) => row.classId === user.classId);
  if (user.role === "kepala_sekolah" && filter.classId) rows = rows.filter((row) => row.classId === filter.classId);
  if (filter.studentId) rows = rows.filter((row) => row.id === filter.studentId);
  if (filter.search?.trim()) {
    const search = filter.search.trim().toLowerCase();
    rows = rows.filter((row) => `${row.studentName} ${row.nis} ${row.className}`.toLowerCase().includes(search));
  }
  return rows;
}

function makeColumns(scope: ReportScope): ReportColumn[] {
  if (scope === "achievement") return [
    { key: "studentName", label: "Nama" }, { key: "className", label: "Kelas / Rombel" }, { key: "badges", label: "Badge" }, { key: "awards", label: "Penghargaan" }, { key: "certificateCount", label: "Sertifikat" },
  ];
  if (scope === "habit") return [
    { key: "studentName", label: "Nama" }, { key: "className", label: "Kelas / Rombel" }, { key: "method", label: "Metode" }, { key: "habitPercent", label: "Aktivitas Kebiasaan %" }, { key: "habitDescription", label: "Deskripsi Isian" }, { key: "initiative", label: "Inisiatif" }, { key: "habitPoints", label: "Poin" }, { key: "habitExp", label: "EXP" },
  ];
  return [
    { key: "studentName", label: "Nama" }, { key: "nis", label: "NIS" }, { key: "className", label: "Kelas / Rombel" }, { key: "method", label: "Metode" }, { key: "activityPercent", label: "Aktivitas %" }, { key: "points", label: "Poin" }, { key: "exp", label: "EXP" }, { key: "level", label: "Level" },
  ];
}

function makeRows(scope: ReportScope, filter: ReportFilter, rows: ReturnType<typeof applyScope>): ReportRow[] {
  if (scope !== "habit") return rows;
  const selections = filter.initiatives?.length ? filter.initiatives : (["Sadar sendiri", "Disuruh"] as InitiativeReportValue[]);
  return rows
    .map((row) => {
      const isFilled = row.method === "DIGITAL" && (row.completedDays ?? 0) > 0;
      const initiative = row.initiative ?? null;
      return {
        ...row,
        habitPercent: row.method === "MANUAL" ? null : (isFilled ? 100 : 0),
        habitPoints: row.method === "MANUAL" ? null : (isFilled ? Math.max(0, Math.round((row.points ?? 0) / Math.max(row.completedDays ?? 1, 1))) : 0),
        habitExp: row.method === "MANUAL" ? null : (isFilled ? Math.max(0, Math.round((row.exp ?? 0) / Math.max(row.completedDays ?? 1, 1))) : 0),
        habitDescription: isFilled ? HABIT_DESCRIPTIONS[filter.habitId ?? "habit-1"] : "Belum mengisi",
        initiative,
      };
    })
    .filter((row) => row.method === "MANUAL" || !row.initiative || selections.includes(row.initiative));
}

export const reportService = {
  async getContext(user: UserProfile): Promise<ReportContext> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const reports = getAllowedDefinitions(user);
    if (!reports.length) throw new Error("Report Center hanya tersedia untuk Kepala Sekolah dan Wali Kelas.");
    const allowedClassIds = user.role === "wali_kelas" ? [user.classId ?? ""] : ["cls-5a", "cls-8b"];
    return {
      availableReports: reports,
      allowedClassIds,
      allowedStudentIds: MOCK_ROWS.map((row) => row.id),
      availableClasses: user.role === "kepala_sekolah" ? [{ id: "cls-5a", name: "5A • Cendekia" }, { id: "cls-8b", name: "8B • Inspiratif" }] : [],
      availableHabits: HABITS,
      schoolName: "SD ANAKTUMBUH",
      className: user.role === "wali_kelas" ? "5A • Cendekia" : undefined,
    };
  },

  async getReport(user: UserProfile, filter: ReportFilter): Promise<ReportResult> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    if (user.role !== "kepala_sekolah" && user.role !== "wali_kelas") throw new Error("Report Center tidak tersedia untuk role ini.");
    if (!user.permissions.includes("read:reports") && !user.permissions.includes("*")) throw new Error("Anda tidak memiliki izin mengakses laporan.");
    if (filter.startDate > filter.endDate) throw new Error("Tanggal mulai tidak boleh melewati tanggal akhir.");
    if (user.role === "wali_kelas" && filter.classId) throw new Error("Wali Kelas tidak memiliki filter rombel / kelas.");
    const definition = getAllowedDefinitions(user).find((item) => item.id === filter.scope);
    if (!definition) throw new Error("Anda tidak memiliki akses ke jenis laporan ini.");
    if (filter.scope === "habit" && !HABITS.some((habit) => habit.id === filter.habitId)) throw new Error("Kebiasaan belum dipilih.");
    if (filter.scope === "class" && user.role !== "kepala_sekolah") throw new Error("Wali Kelas tidak memiliki jenis laporan per rombel / kelas.");
    const baseRows = applyScope(user, filter);
    const rows = makeRows(filter.scope, filter, baseRows);
    const achievementRows = baseRows.map((row) => ({ id: row.id, studentName: row.studentName, className: row.className, badgeCount: row.badges, awardCount: row.awards, certificateCount: row.awards, latestAward: row.awards > 0 ? "Kebiasaan Mandiri" : null }));
    const selectedHabit = HABITS.find((habit) => habit.id === filter.habitId)?.name;
    const selectedInitiatives = filter.initiatives?.length ? filter.initiatives.join(" + ") : "Semua inisiatif";
    return {
      generatedAt: new Date().toISOString(), scope: filter.scope, period: { startDate: filter.startDate, endDate: filter.endDate },
      title: filter.scope === "habit" ? `Laporan ${selectedHabit ?? "Kebiasaan"}` : definition.title,
      subtitle: filter.scope === "habit" ? `Rekap ${selectedHabit ?? "kebiasaan"} · Inisiatif: ${selectedInitiatives}.` : definition.description,
      columns: makeColumns(filter.scope), rows, achievementRows,
      totals: { students: baseRows.length, digital: baseRows.filter((row) => row.method === "DIGITAL").length, manual: baseRows.filter((row) => row.method === "MANUAL").length, activeDays: baseRows.reduce((sum, row) => sum + (row.completedDays ?? 0), 0) },
      exportAllowed: true, exportFormats: definition.exportFormats,
    };
  },

  async exportReport(user: UserProfile, filter: ReportFilter, format: "csv" | "pdf"): Promise<Blob> {
    if (!user.permissions.includes("export:reports") && !user.permissions.includes("*")) throw new Error("Anda tidak memiliki izin export laporan.");
    const result = await this.getReport(user, filter);
    if (!result.exportAllowed || !result.exportFormats.includes(format)) throw new Error("Export tidak tersedia untuk laporan ini.");
    if (format === "csv") {
      const headers = result.columns.map((column) => column.label).join(",");
      const lines = result.rows.map((row) => result.columns.map((column) => JSON.stringify((row as Record<string, unknown>)[column.key] ?? "")).join(","));
      return new Blob([[headers, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    }
    return new Blob([`${result.title}\nPeriode: ${result.period.startDate} s/d ${result.period.endDate}\nJumlah siswa: ${result.totals.students}\nPDF final akan diproduksi backend.`], { type: "application/pdf" });
  },
};
