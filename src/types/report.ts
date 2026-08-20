import { UserRole } from "./auth";

export type ReportScope = "student" | "class" | "achievement" | "habit";
export type ReportFormat = "csv" | "pdf";
export type ReportPeriodPreset = "this_week" | "this_month" | "this_term" | "custom";
export type InitiativeReportValue = "Sadar sendiri" | "Disuruh";

export interface ReportFilter {
  scope: ReportScope;
  periodPreset: ReportPeriodPreset;
  startDate: string;
  endDate: string;
  classId?: string;
  studentId?: string;
  habitId?: string;
  initiatives?: InitiativeReportValue[];
  search?: string;
}

export interface ReportDefinition {
  id: ReportScope;
  title: string;
  description: string;
  allowedRoles: UserRole[];
  exportFormats: ReportFormat[];
}

export interface ReportRow {
  id: string;
  studentName: string;
  nis: string;
  className: string;
  method: "DIGITAL" | "MANUAL";
  activityPercent: number | null;
  points: number | null;
  exp: number | null;
  level: number | null;
  streak: number | null;
  badges: number;
  awards: number;
  completedDays: number | null;
  habitPercent?: number | null;
  habitPoints?: number | null;
  habitExp?: number | null;
  habitDescription?: string | null;
  initiative?: InitiativeReportValue | null;
}

export interface AchievementReportRow {
  id: string;
  studentName: string;
  className: string;
  badgeCount: number;
  awardCount: number;
  certificateCount: number;
  latestAward: string | null;
}

export interface ReportColumn { key: string; label: string; }

export interface ReportResult {
  generatedAt: string;
  scope: ReportScope;
  period: { startDate: string; endDate: string };
  title: string;
  subtitle: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  achievementRows: AchievementReportRow[];
  totals: { students: number; digital: number; manual: number; activeDays: number };
  exportAllowed: boolean;
  exportFormats: ReportFormat[];
}

export interface ReportContext {
  availableReports: ReportDefinition[];
  allowedClassIds: string[];
  allowedStudentIds: string[];
  availableClasses: { id: string; name: string }[];
  availableHabits: { id: string; name: string }[];
  schoolName: string;
  className?: string;
}
