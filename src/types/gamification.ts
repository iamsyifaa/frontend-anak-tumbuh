import { BadgeItem, CertificateItem, RankingUserItem } from "../types";

export interface StreakSummary {
  current: number;
  best: number;
  remainingChances: number;
  maxMonthlyChances: number;
  monthLabel: string;
  status: "active" | "paused" | "reset";
}

export interface AwardItem {
  id: string;
  title: string;
  description: string;
  habitName: string;
  period: string;
  awardedAt: string;
  issuerName: string;
  certificateId?: string | null;
}

export interface GamificationFeatureFlags {
  rankingEnabled: boolean;
  classRankingEnabled: boolean;
  cohortRankingEnabled: boolean;
}

export interface GamificationOverview {
  streak: StreakSummary;
  badges: BadgeItem[];
  awards: AwardItem[];
  certificates: CertificateItem[];
  ranking: {
    class: RankingUserItem[];
    cohort: RankingUserItem[];
  };
  features: GamificationFeatureFlags;
  source: "backend";
  updatedAt: string;
}
