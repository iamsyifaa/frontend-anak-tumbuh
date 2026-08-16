import { StudentMethod } from "./student";

export type MonitoringActivityStatus = "completed" | "partial" | "not_started";

export interface ClassMonitoringStudent {
  id: string;
  name: string;
  nis?: string;
  method: StudentMethod;
  activityStatus: MonitoringActivityStatus;
  activityLabel: string;
  progressPercent: number;
  points: number;
  exp: number;
  level: number;
  streak: number;
  badgeCount: number;
  awardCount: number;
  lastActivityAt?: string;
  lockedSubmission: boolean;
  commentCount: number;
}

export interface MonitoringComment {
  id: string;
  authorName: string;
  authorRole: "siswa" | "wali_kelas";
  message: string;
  createdAt: string;
}

export interface ClassMonitoringDetail extends ClassMonitoringStudent {
  habits: Array<{
    id: string;
    name: string;
    status: "done" | "not_done" | "not_available";
    indicatorLabel?: string;
  }>;
  weeklyActivity: Array<{
    date: string;
    activityPercent: number;
  }>;
  comments: MonitoringComment[];
  achievements: Array<{
    id: string;
    type: "badge" | "award" | "certificate";
    title: string;
    date?: string;
  }>;
}

export interface ClassMonitoringAggregate {
  classGroup: {
    id: string;
    levelName: string;
    rombelName: string;
    academicYearName: string;
  };
  summary: {
    totalStudents: number;
    digitalStudents: number;
    manualStudents: number;
    activeToday: number;
    averageProgressPercent: number;
  };
  students: ClassMonitoringStudent[];
  permissions: {
    canRead: boolean;
    canComment: boolean;
    canExport: boolean;
  };
}
