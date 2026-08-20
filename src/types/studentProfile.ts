export interface StudentLevelHistoryItem {
  id: string;
  semesterLabel: string;
  academicYearLabel: string;
  level: number;
  levelLabel: string;
  periodLabel: string;
}

export interface StudentProfileData {
  id: string;
  name: string;
  className: string;
  schoolName: string;
  currentLevel: number;
  currentLevelLabel: string;
  levelHistory: StudentLevelHistoryItem[];
}
