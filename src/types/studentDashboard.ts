import { AwardItem, GamificationFeatureFlags, StreakSummary } from "./gamification";
import { BadgeItem, CertificateItem, RankingUserItem } from "../types";

export interface DashboardSummary {
  points: number;
  exp: number;
  level: number;
  levelLabel: string;
  rankLabel?: string;
}

export interface WeeklyActivityItem {
  dayLabel: string;
  date: string;
  completedHabits: number;
  points: number;
  exp: number;
  activityPercent: number;
}

export interface DashboardHistoryItem {
  id: string;
  dateLabel: string;
  habitName: string;
  initiative: "Sadar Sendiri" | "Disuruh";
  pointsAwarded: number;
  expAwarded: number;
  status: "completed";
}

export interface StudentDashboardAggregate {
  student: {
    id: string;
    name: string;
    method: "DIGITAL" | "MANUAL";
    className: string;
  };
  summary: DashboardSummary;
  streak: StreakSummary;
  achievements: {
    badges: BadgeItem[];
    awards: AwardItem[];
    certificates: CertificateItem[];
  };
  history: DashboardHistoryItem[];
  weeklyActivity: WeeklyActivityItem[];
  ranking: {
    enabled: boolean;
    scopeLabel?: string;
    rank?: number;
    points?: number;
    class: RankingUserItem[];
    cohort: RankingUserItem[];
  };
  features: GamificationFeatureFlags;
  source: "backend";
  updatedAt: string;
}
