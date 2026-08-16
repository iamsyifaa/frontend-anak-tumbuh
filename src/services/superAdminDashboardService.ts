import { UserProfile } from "../types/auth";
import { SuperAdminDashboardData, SuperAdminSchoolSummary } from "../types/superAdminDashboard";
import { schoolMasterService } from "./schoolMasterService";
import { studentService } from "./studentService";

export const SUPER_ADMIN_DASHBOARD_PERMISSIONS = {
  read: "read:school_master",
} as const;

const wait = (ms = 260) => new Promise((resolve) => setTimeout(resolve, ms));

const assertSuperAdmin = (user: UserProfile) => {
  if (user.role !== "super_admin") {
    throw new Error("Dashboard ini hanya tersedia untuk Super Admin.");
  }
  if (user.permissions.includes("*") || user.permissions.includes(SUPER_ADMIN_DASHBOARD_PERMISSIONS.read)) {
    return;
  }
  throw new Error("Anda tidak memiliki izin untuk membaca dashboard Super Admin.");
};

/**
 * Mock aggregate contract.
 * Production: replace this implementation with one backend aggregate endpoint.
 * The frontend only presents the response and does not calculate official
 * business metrics such as Poin/EXP/Level.
 */
export const superAdminDashboardService = {
  async getOverview(user: UserProfile): Promise<SuperAdminDashboardData> {
    await wait();
    assertSuperAdmin(user);

    const schools = await schoolMasterService.listSchools(user);

    const summaries = await Promise.all(
      schools.map(async (school): Promise<SuperAdminSchoolSummary> => {
        const [students, classGroups] = await Promise.all([
          studentService.listStudents(user, school.id),
          schoolMasterService.listClassGroups(user, school.id),
        ]);

        const digitalCount = students.filter((student) => student.method === "DIGITAL").length;

        return {
          id: school.id,
          name: school.name,
          status: school.status,
          timezone: school.timezone,
          studentCount: students.length,
          digitalCount,
          manualCount: students.length - digitalCount,
          classGroupCount: classGroups.length,
        };
      }),
    );

    return {
      metrics: {
        totalSchools: summaries.length,
        activeSchools: summaries.filter((school) => school.status === "active").length,
        totalStudents: summaries.reduce((total, school) => total + school.studentCount, 0),
        digitalStudents: summaries.reduce((total, school) => total + school.digitalCount, 0),
        manualStudents: summaries.reduce((total, school) => total + school.manualCount, 0),
        totalClassGroups: summaries.reduce((total, school) => total + school.classGroupCount, 0),
      },
      schools: summaries,
      updatedAt: new Date().toISOString(),
    };
  },
};
