import { UserProfile } from "../types/auth";
import { ClassMonitoringAggregate, ClassMonitoringDetail, ClassMonitoringStudent, MonitoringComment } from "../types/classMonitoring";

export const CLASS_MONITORING_PERMISSIONS = {
  read: "read:student_habits",
  comment: "write:teacher_notes",
  reports: "read:class_reports",
  export: "export:class_monitoring",
} as const;

const wait = (ms = 260) => new Promise((resolve) => setTimeout(resolve, ms));

const students: ClassMonitoringStudent[] = [
  {
    id: "stu-001", name: "Ahmad Rizky", nis: "25001", method: "DIGITAL" as const,
    activityStatus: "completed" as const, activityLabel: "Lengkap hari ini", progressPercent: 100,
    points: 1450, exp: 820, level: 6, streak: 12, badgeCount: 3, awardCount: 2,
    lastActivityAt: "2026-08-15T08:30:00+07:00", lockedSubmission: true, commentCount: 2,
  },
  {
    id: "stu-002", name: "Bintang Pratama", nis: "25002", method: "MANUAL" as const,
    activityStatus: "not_started" as const, activityLabel: "Tidak ada aktivitas aplikasi", progressPercent: 0,
    points: 0, exp: 0, level: 1, streak: 0, badgeCount: 0, awardCount: 0,
    lockedSubmission: false, commentCount: 0,
  },
];

const details: Record<string, ClassMonitoringDetail> = {
  "stu-001": {
    ...students[0],
    habits: [
      { id: "h1", name: "Bangun Pagi", status: "done", indicatorLabel: "Bangun sesuai target" },
      { id: "h2", name: "Beribadah", status: "done", indicatorLabel: "Selesai" },
      { id: "h3", name: "Berolahraga", status: "done", indicatorLabel: "Selesai" },
      { id: "h4", name: "Makan Sehat dan Bergizi", status: "done", indicatorLabel: "Sarapan cukup" },
      { id: "h5", name: "Gemar Belajar", status: "done", indicatorLabel: "Selesai" },
      { id: "h6", name: "Bermasyarakat", status: "done", indicatorLabel: "Selesai" },
      { id: "h7", name: "Tidur Cepat", status: "done", indicatorLabel: "Selesai" },
    ],
    weeklyActivity: [
      { date: "2026-08-09", activityPercent: 80 }, { date: "2026-08-10", activityPercent: 100 },
      { date: "2026-08-11", activityPercent: 100 }, { date: "2026-08-12", activityPercent: 86 },
      { date: "2026-08-13", activityPercent: 100 }, { date: "2026-08-14", activityPercent: 71 },
      { date: "2026-08-15", activityPercent: 100 },
    ],
    comments: [
      { id: "c1", authorName: "Ahmad Rizky", authorRole: "siswa", message: "Hari ini saya berhasil menyelesaikan semua kebiasaan.", createdAt: "2026-08-15T08:35:00+07:00", activityId: "h1", activityName: "Bangun Pagi" },
      { id: "c2", authorName: "Siti Nurhaliza, S.Pd", authorRole: "wali_kelas", message: "Bagus, pertahankan konsistensinya ya!", createdAt: "2026-08-15T09:00:00+07:00", activityId: "h1", activityName: "Bangun Pagi", parentCommentId: "c1" },
    ],
    achievements: [
      { id: "b1", type: "badge", title: "Konsisten Belajar", date: "2026-08-10" },
      { id: "a1", type: "award", title: "Penghargaan Kebiasaan Mandiri", date: "2026-08-01" },
      { id: "s1", type: "certificate", title: "Sertifikat Juli 2026", date: "2026-08-01" },
    ],
  },
  "stu-002": {
    ...students[1], habits: [], weeklyActivity: [], comments: [], achievements: [],
  },
};

function assertPermission(user: UserProfile, permission: string) {
  if (user.permissions.includes("*") || user.permissions.includes(permission)) return;
  throw new Error("Anda tidak memiliki izin untuk tindakan ini.");
}

async function assertWaliScope(user: UserProfile) {
  assertPermission(user, CLASS_MONITORING_PERMISSIONS.read);
  if (user.role !== "wali_kelas" || !user.classId) throw new Error("Dashboard ini hanya tersedia untuk Wali Kelas.");
  const group = { id: "cls-5a", schoolId: "sch-101", academicYearId: "ay-2026-101", levelName: "Kelas 5", rombelName: "Cendekia", homeroomTeacherId: "u-3", homeroomTeacherName: "Siti Nurhaliza, S.Pd" };
  if (user.schoolId !== group.schoolId || user.classId !== group.id || user.id !== group.homeroomTeacherId) {
    throw new Error("Rombel di luar scope Wali Kelas ditolak.");
  }
  return group;
}

export const classMonitoringService = {
  async getAggregate(user: UserProfile): Promise<ClassMonitoringAggregate> {
    await wait();
    const group = await assertWaliScope(user);
    const scoped = students;
    return {
      classGroup: { id: group.id, levelName: group.levelName, rombelName: group.rombelName, academicYearName: "2026/2027" },
      summary: {
        totalStudents: scoped.length,
        digitalStudents: scoped.filter((s) => s.method === "DIGITAL").length,
        manualStudents: scoped.filter((s) => s.method === "MANUAL").length,
        activeToday: scoped.filter((s) => s.activityStatus === "completed" || s.activityStatus === "partial").length,
        averageProgressPercent: Math.round(scoped.reduce((sum, s) => sum + s.progressPercent, 0) / Math.max(scoped.length, 1)),
      },
      students: scoped,
      permissions: {
        canRead: user.permissions.includes("*") || user.permissions.includes(CLASS_MONITORING_PERMISSIONS.read),
        canComment: user.permissions.includes("*") || user.permissions.includes(CLASS_MONITORING_PERMISSIONS.comment),
        canReadReports: user.permissions.includes("*") || user.permissions.includes(CLASS_MONITORING_PERMISSIONS.reports),
        canExport: user.permissions.includes("*") || user.permissions.includes(CLASS_MONITORING_PERMISSIONS.export),
      },
    };
  },

  async getStudentDetail(user: UserProfile, studentId: string): Promise<ClassMonitoringDetail> {
    await wait();
    const group = await assertWaliScope(user);
    const detail = details[studentId];
    if (!detail) throw new Error("Detail siswa tidak ditemukan.");
    const allowedStudent = students.find((s) => s.id === studentId);
    if (!allowedStudent || group.id !== "cls-5a") throw new Error("Siswa di luar scope rombel ditolak.");
    return detail;
  },

  async addComment(user: UserProfile, studentId: string, message: string, activityId?: string): Promise<MonitoringComment> {
    await wait();
    assertPermission(user, CLASS_MONITORING_PERMISSIONS.comment);
    const group = await assertWaliScope(user);
    if (!details[studentId] || group.id !== "cls-5a") throw new Error("Siswa di luar scope rombel ditolak.");
    const trimmed = message.trim();
    if (!trimmed) throw new Error("Komentar wajib diisi.");
    if (trimmed.length > 500) throw new Error("Komentar maksimal 500 karakter.");
    const activity = details[studentId].habits.find((habit) => habit.id === activityId);
    const comment: MonitoringComment = {
      id: `comment-${Date.now()}`, authorName: user.name, authorRole: "wali_kelas", message: trimmed,
      createdAt: new Date().toISOString(), activityId: activity?.id, activityName: activity?.name,
    };
    details[studentId].comments = [...details[studentId].comments, comment];
    details[studentId].commentCount += 1;
    return comment;
  },

  async replyComment(user: UserProfile, studentId: string, parentCommentId: string, message: string): Promise<MonitoringComment> {
    await wait();
    assertPermission(user, CLASS_MONITORING_PERMISSIONS.comment);
    const group = await assertWaliScope(user);
    const detail = details[studentId];
    if (!detail || group.id !== "cls-5a") throw new Error("Siswa di luar scope rombel ditolak.");
    const parent = detail.comments.find((item) => item.id === parentCommentId);
    if (!parent) throw new Error("Komentar yang akan dibalas tidak ditemukan.");
    const trimmed = message.trim();
    if (!trimmed) throw new Error("Balasan wajib diisi.");
    if (trimmed.length > 500) throw new Error("Balasan maksimal 500 karakter.");
    const reply: MonitoringComment = {
      id: `comment-${Date.now()}`, authorName: user.name, authorRole: "wali_kelas", message: trimmed,
      createdAt: new Date().toISOString(), activityId: parent.activityId, activityName: parent.activityName, parentCommentId,
    };
    detail.comments = [...detail.comments, reply];
    detail.commentCount += 1;
    return reply;
  },
};
