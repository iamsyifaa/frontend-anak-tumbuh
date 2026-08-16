export interface SuperAdminDashboardMetrics {
  totalSchools: number;
  activeSchools: number;
  totalStudents: number;
  digitalStudents: number;
  manualStudents: number;
  totalClassGroups: number;
}

export interface SuperAdminSchoolSummary {
  id: string;
  name: string;
  status: "active" | "inactive";
  timezone: string;
  studentCount: number;
  digitalCount: number;
  manualCount: number;
  classGroupCount: number;
}

export interface SuperAdminDashboardData {
  metrics: SuperAdminDashboardMetrics;
  schools: SuperAdminSchoolSummary[];
  updatedAt: string;
}
