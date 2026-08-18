export interface SuperAdminDashboardMetrics {
  totalSchools: number;
  activeSchools: number;
  totalStudents: number;
  digitalStudents: number;
  manualStudents: number;
  totalClassGroups: number;
  totalTeachers: number;
  activeTeachers: number;
  activeAcademicYears: number;
  generatedQrStudents: number;
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
  teacherCount: number;
  activeTeacherCount: number;
  activeAcademicYear?: string;
  generatedQrCount: number;
}

export interface SuperAdminAcademicYearSummary {
  schoolId: string;
  schoolName: string;
  activeYear?: string;
  totalYears: number;
}

export interface SuperAdminAccountSummary {
  teachers: number;
  activeTeachers: number;
  students: number;
  digitalStudents: number;
  manualStudents: number;
  generatedQrStudents: number;
}

export interface SuperAdminConfigurationSummary {
  sevenHabits: "published" | "draft" | "unavailable";
  pointsAndExp: "published" | "draft" | "unavailable";
  ranking: "backend_managed";
}

export interface SuperAdminDashboardData {
  metrics: SuperAdminDashboardMetrics;
  schools: SuperAdminSchoolSummary[];
  academicYears: SuperAdminAcademicYearSummary[];
  accounts: SuperAdminAccountSummary;
  configuration: SuperAdminConfigurationSummary;
  updatedAt: string;
}
