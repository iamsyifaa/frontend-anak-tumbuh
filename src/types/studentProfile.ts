export interface StudentLevelHistoryItem {
  id: string;
  semesterLabel: string;
  academicYearLabel: string;
  level: number;
  levelLabel: string;
  periodLabel: string;
  isActive?: boolean;
}

export interface StudentProfileData {
  id: string;
  name: string;
  className: string;
  schoolName: string;
  currentLevel: number;
  currentLevelLabel: string;
  totalPoints: number;
  totalExp: number;
  badgeCount: number;
  awardCount: number;
  levelHistory: StudentLevelHistoryItem[];
}
