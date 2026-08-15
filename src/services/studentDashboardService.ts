import { StudentDashboardAggregate } from "../types/studentDashboard";
import { gamificationService } from "./gamificationService";
import { pointConfigurationService } from "./pointConfigurationService";
import { UserProfile } from "../types/auth";
import { INITIAL_HISTORIES } from "../data/mockData";

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

const history = INITIAL_HISTORIES.slice(0, 6).map((item, index) => ({
  id: item.id,
  dateLabel: item.date,
  habitName: item.habitTitle,
  initiative: item.initiative,
  pointsAwarded: item.pointsEarned,
  expAwarded: [12, 10, 8, 12, 10, 8][index] ?? 8,
  status: "completed" as const,
}));

export const studentDashboardService = {
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
