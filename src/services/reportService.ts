import { UserProfile } from "../types/auth";
import {
  ReportContext,
  ReportDefinition,
  ReportFilter,
  ReportResult,
} from "../types/report";

const REPORTS: ReportDefinition[] = [
  {
    id: "student",
    title: "Laporan Siswa",
    description: "Perkembangan siswa sesuai scope akses dan periode yang dipilih.",
    allowedRoles: ["super_admin", "kepala_sekolah", "wali_kelas", "siswa"],
    exportFormats: ["csv", "pdf"],
  },
  {
    id: "class",
    title: "Laporan Rombel / Kelas",
    description: "Ringkasan aktivitas dan perkembangan siswa dalam rombel yang berwenang.",
    allowedRoles: ["super_admin", "kepala_sekolah", "wali_kelas"],
    exportFormats: ["csv", "pdf"],
  },
  {
    id: "school",
    title: "Laporan Sekolah",
    description: "Ringkasan perkembangan tingkat sekolah sesuai kewenangan.",
    allowedRoles: ["super_admin", "kepala_sekolah"],
    exportFormats: ["csv", "pdf"],
  },
  {
    id: "achievement",
    title: "Laporan Pencapaian",
    description: "Badge, penghargaan, dan sertifikat yang tercatat pada scope akses.",
    allowedRoles: ["super_admin", "kepala_sekolah", "wali_kelas", "siswa"],
    exportFormats: ["csv", "pdf"],
  },
];

const MOCK_ROWS = [
  { id: "stu-001", studentName: "Ahmad Rizky", nis: "10001", className: "5A • Cendekia", method: "DIGITAL" as const, activityPercent: 92, points: 1450, exp: 820, level: 6, streak: 12, badges: 4, awards: 2, completedDays: 6 },
  { id: "stu-002", studentName: "Alya Putri", nis: "10002", className: "5A • Cendekia", method: "DIGITAL" as const, activityPercent: 84, points: 1280, exp: 740, level: 5, streak: 8, badges: 3, awards: 1, completedDays: 5 },
  { id: "stu-003", studentName: "Bima Pratama", nis: "10003", className: "5A • Cendekia", method: "MANUAL" as const, activityPercent: null, points: null, exp: null, level: null, streak: null, badges: 0, awards: 0, completedDays: null },
  { id: "stu-004", studentName: "Citra Lestari", nis: "10004", className: "5A • Cendekia", method: "DIGITAL" as const, activityPercent: 76, points: 1040, exp: 610, level: 4, streak: 5, badges: 2, awards: 1, completedDays: 4 },
];

function getAllowedDefinitions(user: UserProfile): ReportDefinition[] {
  return REPORTS.filter((report) => report.allowedRoles.includes(user.role));
}

export const reportService = {
  async getContext(user: UserProfile): Promise<ReportContext> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const reports = getAllowedDefinitions(user);
    const rows = user.role === "siswa" ? MOCK_ROWS.filter((row) => row.id === "stu-001") : MOCK_ROWS;
    return {
      availableReports: reports,
      allowedClassIds: user.classId ? [user.classId] : ["cls-5a"],
      allowedStudentIds: user.role === "siswa" ? ["stu-001"] : rows.map((row) => row.id),
      schoolName: "SD ANAKTUMBUH",
      className: user.role === "wali_kelas" ? "5A • Cendekia" : undefined,
    };
  },

  async getReport(user: UserProfile, filter: ReportFilter): Promise<ReportResult> {
    await new Promise((resolve) => setTimeout(resolve, 550));
    if (!user.permissions.includes("read:reports") && !user.permissions.includes("*")) {
      throw new Error("Anda tidak memiliki izin mengakses laporan.");
    }
    const definition = getAllowedDefinitions(user).find((item) => item.id === filter.scope);
    if (!definition) throw new Error("Anda tidak memiliki akses ke jenis laporan ini.");
    if (filter.startDate > filter.endDate) throw new Error("Tanggal mulai tidak boleh melewati tanggal akhir.");

    let rows = [...MOCK_ROWS];
    if (user.role === "siswa") rows = rows.filter((row) => row.id === "stu-001");
    if (user.role === "wali_kelas") rows = rows.filter((row) => row.className.startsWith("5A"));
    if (filter.classId) rows = rows.filter((row) => filter.classId === "cls-5a" ? row.className.startsWith("5A") : false);
    if (filter.studentId) rows = rows.filter((row) => row.id === filter.studentId);
    if (filter.search?.trim()) {
      const search = filter.search.trim().toLowerCase();
      rows = rows.filter((row) => `${row.studentName} ${row.nis} ${row.className}`.toLowerCase().includes(search));
    }

    const achievementRows = rows.map((row) => ({
      id: row.id,
      studentName: row.studentName,
      className: row.className,
      badgeCount: row.badges,
      awardCount: row.awards,
      certificateCount: row.awards,
      latestAward: row.awards > 0 ? "Kebiasaan Mandiri" : null,
    }));

    return {
      generatedAt: new Date().toISOString(),
      scope: filter.scope,
      period: { startDate: filter.startDate, endDate: filter.endDate },
      title: definition.title,
      rows,
      achievementRows,
      totals: {
        students: rows.length,
        digital: rows.filter((row) => row.method === "DIGITAL").length,
        manual: rows.filter((row) => row.method === "MANUAL").length,
        activeDays: rows.reduce((sum, row) => sum + (row.completedDays ?? 0), 0),
      },
      exportAllowed: true,
      exportFormats: definition.exportFormats,
    };
  },

  async exportReport(user: UserProfile, filter: ReportFilter, format: "csv" | "pdf"): Promise<Blob> {
    if (!user.permissions.includes("export:reports") && !user.permissions.includes("*")) {
      throw new Error("Anda tidak memiliki izin export laporan.");
    }
    const result = await this.getReport(user, filter);
    if (!result.exportAllowed || !result.exportFormats.includes(format)) {
      throw new Error("Export tidak tersedia untuk laporan ini.");
    }
    if (format === "csv") {
      const header = ["Nama", "NIS", "Kelas/Rombel", "Metode", "Aktivitas %", "Poin", "EXP", "Level", "Streak", "Badge", "Penghargaan"].join(",");
      const lines = result.rows.map((row) => [
        row.studentName, row.nis, row.className, row.method, row.activityPercent ?? "", row.points ?? "", row.exp ?? "", row.level ?? "", row.streak ?? "", row.badges, row.awards,
      ].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","));
      return new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    }
    const text = `${result.title}\nPeriode: ${result.period.startDate} s/d ${result.period.endDate}\nJumlah siswa: ${result.totals.students}\nExport PDF final akan diproduksi backend.`;
    return new Blob([text], { type: "application/pdf" });
  },
};
