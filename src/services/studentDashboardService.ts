import { StudentDashboardAggregate } from "../types/studentDashboard";
import { gamificationService } from "./gamificationService";
import { pointConfigurationService } from "./pointConfigurationService";
import { UserProfile } from "../types/auth";
import { INITIAL_HISTORIES } from "../data/mockData";
import { StudentActivityComment } from "../types/studentDashboard";

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const weeklyActivity = [
  { dayLabel: "Sen", date: "2026-08-10", completedHabits: 4, points: 28, exp: 32, activityPercent: 80 },
  { dayLabel: "Sel", date: "2026-08-11", completedHabits: 6, points: 42, exp: 48, activityPercent: 100 },
  { dayLabel: "Rab", date: "2026-08-12", completedHabits: 5, points: 35, exp: 40, activityPercent: 92 },
  { dayLabel: "Kam", date: "2026-08-13", completedHabits: 3, points: 20, exp: 24, activityPercent: 62 },
  { dayLabel: "Jum", date: "2026-08-14", completedHabits: 6, points: 44, exp: 50, activityPercent: 100 },
  { dayLabel: "Sab", date: "2026-08-15", completedHabits: 2, points: 14, exp: 18, activityPercent: 42 },
  { dayLabel: "Min", date: "2026-08-16", completedHabits: 0, points: 0, exp: 0, activityPercent: 0 },
];


const teacherComments: StudentActivityComment[] = [
  { id: "tc-1", habitId: "habit-1", authorName: "Siti Nurhaliza, S.Pd", authorRole: "wali_kelas", message: "Bagus, sudah mulai membangun kebiasaan pagi dengan mandiri. Pertahankan ya!", createdAt: "2026-08-15T09:00:00+07:00" },
  { id: "tc-2", habitId: "habit-2", authorName: "Siti Nurhaliza, S.Pd", authorRole: "wali_kelas", message: "Terima kasih sudah konsisten. Semoga kebiasaan baik ini terus terbawa setiap hari.", createdAt: "2026-08-15T09:05:00+07:00" },
  { id: "tc-3", habitId: "habit-3", authorName: "Siti Nurhaliza, S.Pd", authorRole: "wali_kelas", message: "Mantap! Tetap jaga semangat untuk bergerak aktif.", createdAt: "2026-08-15T09:10:00+07:00" },
  { id: "tc-4", habitId: "habit-4", authorName: "Siti Nurhaliza, S.Pd", authorRole: "wali_kelas", message: "Pilihan yang baik. Terus biasakan makan sehat dan bergizi.", createdAt: "2026-08-15T09:15:00+07:00" },
  { id: "tc-5", habitId: "habit-5", authorName: "Siti Nurhaliza, S.Pd", authorRole: "wali_kelas", message: "Senang melihat semangat belajarmu. Lanjutkan membaca dan belajar setiap hari.", createdAt: "2026-08-15T09:20:00+07:00" },
  { id: "tc-6", habitId: "habit-6", authorName: "Siti Nurhaliza, S.Pd", authorRole: "wali_kelas", message: "Sikap peduli kepada sekitar adalah karakter hebat. Terima kasih sudah berinisiatif.", createdAt: "2026-08-15T09:25:00+07:00" },
  { id: "tc-7", habitId: "habit-7", authorName: "Siti Nurhaliza, S.Pd", authorRole: "wali_kelas", message: "Istirahat yang cukup membantu tubuh tetap sehat dan siap belajar.", createdAt: "2026-08-15T09:30:00+07:00" },
];

const history = INITIAL_HISTORIES.slice(0, 6).map((item, index) => ({
  id: item.id,
  dateLabel: item.date,
  habitName: item.habitTitle,
  initiative: item.initiative,
  pointsAwarded: item.pointsEarned,
  expAwarded: [12, 10, 8, 12, 10, 8][index] ?? 8,
  status: "completed" as const,
}));

export interface AddActivityCommentInput {
  user: UserProfile;
  habitId: string;
  message: string;
  parentCommentId?: string;
}

export const studentDashboardService = {
  async addActivityComment(input: AddActivityCommentInput): Promise<StudentActivityComment> {
    await delay(180);
    const message = input.message.trim();
    if (!message) throw new Error("Komentar tidak boleh kosong.");
    return {
      id: `sc-${Date.now()}`,
      habitId: input.habitId,
      authorName: input.user.name,
      authorRole: "siswa",
      message,
      createdAt: new Date().toISOString(),
      parentCommentId: input.parentCommentId,
    };
  },

  async getAggregate(user: UserProfile): Promise<StudentDashboardAggregate> {
    await delay();

    const [summary, overview] = await Promise.all([
      pointConfigurationService.getStudentSummary(user),
      gamificationService.getOverview(user.id),
    ]);

    const rankingEnabled = overview.features.rankingEnabled;
    const currentUser = rankingEnabled
      ? [...overview.ranking.class, ...overview.ranking.cohort].find((item) => item.isCurrentUser)
      : undefined;

    return {
      student: {
        id: user.id,
        name: user.name,
        method: user.method ?? "DIGITAL",
        className: currentUser?.className ?? "VIII-B",
      },
      summary: {
        points: summary.points,
        exp: summary.exp,
        level: summary.level,
        levelLabel: `Lv. ${summary.level}`,
        rankLabel: rankingEnabled && currentUser ? `#${currentUser.rank}` : undefined,
      },
      streak: overview.streak,
      achievements: {
        badges: overview.badges,
        awards: overview.awards,
        certificates: overview.certificates,
      },
      history,
      teacherComments: teacherComments.filter((comment) => user.method === "DIGITAL"),
      weeklyActivity,
      ranking: {
        enabled: rankingEnabled,
        scopeLabel: currentUser ? `Ranking ${currentUser.className}` : undefined,
        rank: currentUser?.rank,
        points: currentUser?.points,
        class: overview.ranking.class,
        cohort: overview.ranking.cohort,
      },
      features: overview.features,
      source: "backend",
      updatedAt: new Date().toISOString(),
    };
  },
};
