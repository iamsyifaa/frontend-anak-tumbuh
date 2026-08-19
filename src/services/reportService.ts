import { UserProfile } from "../types/auth";
import { ReportColumn, ReportContext, ReportDefinition, ReportFilter, ReportResult, ReportRow, ReportScope } from "../types/report";

const REPORTS: ReportDefinition[] = [
  { id: "student", title: "Laporan Siswa", description: "Perkembangan siswa sesuai scope akses dan periode.", allowedRoles: ["kepala_sekolah", "wali_kelas"], exportFormats: ["csv", "pdf"] },
  { id: "class", title: "Laporan Rombel / Kelas", description: "Ringkasan aktivitas dalam rombel yang dipilih.", allowedRoles: ["kepala_sekolah"], exportFormats: ["csv", "pdf"] },
  { id: "school", title: "Laporan Sekolah", description: "Ringkasan perkembangan seluruh sekolah.", allowedRoles: ["kepala_sekolah"], exportFormats: ["csv", "pdf"] },
  { id: "achievement", title: "Laporan Pencapaian", description: "Badge, penghargaan, dan sertifikat yang tercatat.", allowedRoles: ["kepala_sekolah", "wali_kelas"], exportFormats: ["csv", "pdf"] },
  { id: "habit", title: "Laporan Per Kebiasaan", description: "Rekap satu dari tujuh kebiasaan secara terpisah.", allowedRoles: ["kepala_sekolah", "wali_kelas"], exportFormats: ["csv", "pdf"] },
  { id: "initiative", title: "Laporan Per Inisiatif", description: "Rekap Sadar sendiri vs Disuruh.", allowedRoles: ["kepala_sekolah", "wali_kelas"], exportFormats: ["csv", "pdf"] },
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
  { id: "stu-001", studentName: "Ahmad Rizky", nis: "10001", className: "5A • Cendekia", method: "DIGITAL", activityPercent: 92, points: 1450, exp: 820, level: 6, streak: 12, badges: 4, awards: 2, completedDays: 6, academicYearId: "ay-2026", classId: "cls-5a" },
  { id: "stu-002", studentName: "Alya Putri", nis: "10002", className: "5A • Cendekia", method: "DIGITAL", activityPercent: 84, points: 1280, exp: 740, level: 5, streak: 8, badges: 3, awards: 1, completedDays: 5, academicYearId: "ay-2026", classId: "cls-5a" },
  { id: "stu-003", studentName: "Bima Pratama", nis: "10003", className: "5A • Cendekia", method: "MANUAL", activityPercent: null, points: null, exp: null, level: null, streak: null, badges: 0, awards: 0, completedDays: null, academicYearId: "ay-2026", classId: "cls-5a" },
  { id: "stu-004", studentName: "Citra Lestari", nis: "10004", className: "8B • Inspiratif", method: "DIGITAL", activityPercent: 76, points: 1040, exp: 610, level: 4, streak: 5, badges: 2, awards: 1, completedDays: 4, academicYearId: "ay-2026", classId: "cls-8b" },
];

const pct = (base: number | null, offset: number) => (base == null ? null : Math.max(0, Math.min(100, base + offset)));
const habitOffset: Record<string, number> = { "habit-1": 2, "habit-2": -4, "habit-3": 5, "habit-4": -1, "habit-5": -7, "habit-6": 3, "habit-7": 0 };

function getAllowedDefinitions(user: UserProfile) {
  if (user.role === "super_admin" || user.role === "siswa") return [];
  return REPORTS.filter((report) => report.allowedRoles.includes(user.role));
}

function applyScope(user: UserProfile, filter: ReportFilter) {
  let rows = [...MOCK_ROWS];
  if (user.role === "wali_kelas") rows = rows.filter((row) => row.classId === user.classId);
  if (filter.classId) rows = rows.filter((row) => row.classId === filter.classId);
  if (filter.studentId) rows = rows.filter((row) => row.id === filter.studentId);
  if (filter.search?.trim()) {
    const search = filter.search.trim().toLowerCase();
    rows = rows.filter((row) => `${row.studentName} ${row.nis} ${row.className}`.toLowerCase().includes(search));
  }
  return rows;
}

function makeColumns(scope: ReportScope): ReportColumn[] {
  if (scope === "achievement") return [
    { key: "studentName", label: "Nama" },
    { key: "className", label: "Kelas / Rombel" },
    { key: "badges", label: "Badge" },
    { key: "awards", label: "Penghargaan" },
    { key: "certificateCount", label: "Sertifikat" },
  ];
  if (scope === "habit") return [
    { key: "studentName", label: "Nama" },
    { key: "className", label: "Kelas / Rombel" },
    { key: "method", label: "Metode" },
    { key: "habitPercent", label: "Aktivitas Kebiasaan %" },
    { key: "habitPoints", label: "Poin" },
    { key: "habitExp", label: "EXP" },
  ];
  if (scope === "initiative") return [
    { key: "studentName", label: "Nama" },
    { key: "className", label: "Kelas / Rombel" },
    { key: "selfInitiativeCount", label: "Sadar sendiri" },
    { key: "promptedInitiativeCount", label: "Disuruh" },
  ];
  return [
    { key: "studentName", label: "Nama" },
    { key: "nis", label: "NIS" },
    { key: "className", label: "Kelas / Rombel" },
    { key: "method", label: "Metode" },
    { key: "activityPercent", label: "Aktivitas %" },
    { key: "points", label: "Poin" },
    { key: "exp", label: "EXP" },
    { key: "level", label: "Level" },
  ];
}

function makeRows(scope: ReportScope, filter: ReportFilter, rows: ReturnType<typeof applyScope>): ReportRow[] {
  if (scope === "habit") {
    const offset = habitOffset[filter.habitId ?? "habit-1"] ?? 0;
    return rows.map((row) => ({ ...row, habitPercent: pct(row.activityPercent, offset), habitPoints: row.points == null ? null : Math.round(row.points * (Math.max(25, 75 + offset) / 100)), habitExp: row.exp == null ? null : Math.round(row.exp * (Math.max(25, 72 + offset) / 100)) }));
  }
  if (scope === "initiative") {
    return rows.map((row) => {
      const total = row.completedDays ?? 0;
      const selfCount = row.method === "MANUAL" ? null : Math.max(0, Math.round(total * 0.65));
      const promptedCount = row.method === "MANUAL" ? null : Math.max(0, total - (selfCount ?? 0));
      if (filter.initiative === "Sadar sendiri") return { ...row, selfInitiativeCount: selfCount, promptedInitiativeCount: 0 };
      if (filter.initiative === "Disuruh") return { ...row, selfInitiativeCount: 0, promptedInitiativeCount: promptedCount };
      return { ...row, selfInitiativeCount: selfCount, promptedInitiativeCount: promptedCount };
    });
  }
  return rows;
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
    if (user.role === "wali_kelas" && filter.scope === "class") throw new Error("Wali Kelas tidak memiliki filter laporan per rombel / kelas.");
    const definition = getAllowedDefinitions(user).find((item) => item.id === filter.scope);
    if (!definition) throw new Error("Anda tidak memiliki akses ke jenis laporan ini.");
    if (filter.scope === "habit" && !HABITS.some((habit) => habit.id === filter.habitId)) throw new Error("Kebiasaan belum dipilih.");

    const baseRows = applyScope(user, filter);
    const rows = makeRows(filter.scope, filter, baseRows);
    const achievementRows = baseRows.map((row) => ({ id: row.id, studentName: row.studentName, className: row.className, badgeCount: row.badges, awardCount: row.awards, certificateCount: row.awards, latestAward: row.awards > 0 ? "Kebiasaan Mandiri" : null }));
    const selectedHabit = HABITS.find((habit) => habit.id === filter.habitId)?.name;
    const initiativeLabel = filter.initiative === "ALL" || !filter.initiative ? "Semua inisiatif" : filter.initiative;
    const title = filter.scope === "habit" ? `Laporan ${selectedHabit ?? "Kebiasaan"}` : filter.scope === "initiative" ? `Laporan Inisiatif — ${initiativeLabel}` : definition.title;
    const subtitle = filter.scope === "habit" ? `Rekap khusus ${selectedHabit ?? "kebiasaan"}.` : filter.scope === "initiative" ? "Perbandingan aktivitas yang dilakukan sadar sendiri dan setelah diingatkan/diperintah." : definition.description;

    return {
      generatedAt: new Date().toISOString(),
      scope: filter.scope,
      period: { startDate: filter.startDate, endDate: filter.endDate },
      title,
      subtitle,
      columns: makeColumns(filter.scope),
      rows,
      achievementRows,
      totals: {
        students: baseRows.length,
        digital: baseRows.filter((row) => row.method === "DIGITAL").length,
        manual: baseRows.filter((row) => row.method === "MANUAL").length,
        activeDays: baseRows.reduce((sum, row) => sum + (row.completedDays ?? 0), 0),
      },
      exportAllowed: true,
      exportFormats: definition.exportFormats,
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
    return new Blob([
      `${result.title}\nPeriode: ${result.period.startDate} s/d ${result.period.endDate}\nJumlah siswa: ${result.totals.students}\nPDF final akan diproduksi backend.`,
    ], { type: "application/pdf" });
  },
};
