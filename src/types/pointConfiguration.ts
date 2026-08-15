export interface LevelThreshold {
  level: number;
  requiredExp: number;
}

export interface PointConfiguration {
  id: string;
  scope: "global" | "school";
  schoolId?: string;
  version: number;
  status: "draft" | "published";
  initiativeBonusPoints: number;
  levelThresholds: LevelThreshold[];
  updatedAt: string;
}

export interface GamificationSummary {
  studentId: string;
  points: number;
  exp: number;
  level: number;
  rank?: number | null;
  nextLevelExp?: number | null;
  expIntoCurrentLevel?: number | null;
  expToNextLevel?: number | null;
  source: "backend";
  updatedAt: string;
}
