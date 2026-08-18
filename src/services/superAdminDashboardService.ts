import { UserProfile } from "../types/auth";
import { SuperAdminDashboardData, SuperAdminSchoolSummary } from "../types/superAdminDashboard";
import { schoolMasterService } from "./schoolMasterService";
import { studentService } from "./studentService";
import { teacherService } from "./teacherService";
import { habitConfigurationService } from "./habitConfigurationService";
import { pointConfigurationService } from "./pointConfigurationService";

export const SUPER_ADMIN_DASHBOARD_PERMISSIONS = {
  read: "read:school_master",
} as const;

const wait = (ms = 260) => new Promise((resolve) => setTimeout(resolve, ms));

const assertSuperAdmin = (user: UserProfile) => {
  if (user.role !== "super_admin") throw new Error("Dashboard ini hanya tersedia untuk Super Admin.");
  if (user.permissions.includes("*") || user.permissions.includes(SUPER_ADMIN_DASHBOARD_PERMISSIONS.read)) return;
  throw new Error("Anda tidak memiliki izin untuk membaca dashboard Super Admin.");
};

const getConfigurationStatus = async (user: UserProfile) => {
  let sevenHabits: "published" | "draft" | "unavailable" = "unavailable";
  let pointsAndExp: "published" | "draft" | "unavailable" = "unavailable";

  try {
    const config = await habitConfigurationService.getConfiguration(user, "sch-101");
    sevenHabits = config.status;
  } catch {
    // Availability is represented explicitly; the UI must not invent configuration state.
  }

  try {
    const config = await pointConfigurationService.getConfiguration(user, "sch-101");
    pointsAndExp = config.status;
  } catch {
    // Availability is represented explicitly; the UI must not invent configuration state.
  }

  return { sevenHabits, pointsAndExp, ranking: "backend_managed" as const };
};

/**
 * Mock aggregate contract for the Super Admin dashboard.
 * Production should be replaced by one backend aggregate endpoint.
 * The frontend presents backend/mock responses and does not calculate official
 * Poin/EXP/Level/Ranking values.
 */
export const superAdminDashboardService = {
  async getOverview(user: UserProfile): Promise<SuperAdminDashboardData> {
    await wait();
    assertSuperAdmin(user);

    const schools = await schoolMasterService.listSchools(user);
    const summaries = await Promise.all(
      schools.map(async (school): Promise<SuperAdminSchoolSummary> => {
        const [students, classGroups, teachers, academicYears] = await Promise.all([
          studentService.listStudents(user, school.id),
          schoolMasterService.listClassGroups(user, school.id),
          teacherService.list(user, school.id),
          schoolMasterService.listAcademicYears(user, school.id),
        ]);

        const digitalCount = students.filter((student) => student.method === "DIGITAL").length;
        const generatedQrCount = students.filter((student) => student.method === "DIGITAL" && student.qrStatus === "active").length;
        const activeYear = academicYears.find((year) => year.status === "active");

        return {
          id: school.id,
          name: school.name,
          status: school.status,
          timezone: school.timezone,
          studentCount: students.length,
          digitalCount,
          manualCount: students.length - digitalCount,
          classGroupCount: classGroups.length,
          teacherCount: teachers.length,
          activeTeacherCount: teachers.filter((teacher) => teacher.status === "active").length,
          activeAcademicYear: activeYear?.name,
          generatedQrCount,
        };
      }),
    );

    const academicYears = await Promise.all(
      schools.map(async (school) => {
        const years = await schoolMasterService.listAcademicYears(user, school.id);
        return {
          schoolId: school.id,
          schoolName: school.name,
          activeYear: years.find((year) => year.status === "active")?.name,
          totalYears: years.length,
        };
      }),
    );

    const accounts = {
      teachers: summaries.reduce((total, school) => total + school.teacherCount, 0),
      activeTeachers: summaries.reduce((total, school) => total + school.activeTeacherCount, 0),
      students: summaries.reduce((total, school) => total + school.studentCount, 0),
      digitalStudents: summaries.reduce((total, school) => total + school.digitalCount, 0),
      manualStudents: summaries.reduce((total, school) => total + school.manualCount, 0),
      generatedQrStudents: summaries.reduce((total, school) => total + school.generatedQrCount, 0),
    };

    const configuration = await getConfigurationStatus(user);

    return {
      metrics: {
        totalSchools: summaries.length,
        activeSchools: summaries.filter((school) => school.status === "active").length,
        totalStudents: accounts.students,
        digitalStudents: accounts.digitalStudents,
        manualStudents: accounts.manualStudents,
        totalClassGroups: summaries.reduce((total, school) => total + school.classGroupCount, 0),
        totalTeachers: accounts.teachers,
        activeTeachers: accounts.activeTeachers,
        activeAcademicYears: academicYears.filter((year) => Boolean(year.activeYear)).length,
        generatedQrStudents: accounts.generatedQrStudents,
      },
      schools: summaries,
      academicYears,
      accounts,
      configuration,
      updatedAt: new Date().toISOString(),
    };
  },
};
