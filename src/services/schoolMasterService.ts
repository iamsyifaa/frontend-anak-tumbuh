import { UserProfile } from "../types/auth";
import {
  AcademicYear,
  ClassGroup,
  CreateAcademicYearInput,
  CreateClassGroupInput,
  UpdateAcademicYearInput,
  UpdateClassGroupInput,
  CreateSchoolInput,
  MasterTeacherOption,
  School,
  UpdateSchoolInput,
} from "../types/school";

export const MASTER_PERMISSIONS = {
  read: "read:school_master",
  write: "write:school_master",
} as const;

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

let schools: School[] = [
  {
    id: "sch-101",
    name: "SDN Anak Tumbuh 01",
    timezone: "Asia/Jakarta",
    status: "active",
  },
  {
    id: "sch-102",
    name: "TK Tumbuh Ceria",
    timezone: "Asia/Jakarta",
    status: "active",
  },
];

let academicYears: AcademicYear[] = [
  {
    id: "ay-2026-101",
    schoolId: "sch-101",
    name: "2026/2027",
    startDate: "2026-07-01",
    endDate: "2027-06-30",
    status: "active",
  },
  {
    id: "ay-2025-101",
    schoolId: "sch-101",
    name: "2025/2026",
    startDate: "2025-07-01",
    endDate: "2026-06-30",
    status: "inactive",
  },
  {
    id: "ay-2026-102",
    schoolId: "sch-102",
    name: "2026/2027",
    startDate: "2026-07-01",
    endDate: "2027-06-30",
    status: "active",
  },
];

let classGroups: ClassGroup[] = [
  {
    id: "cls-5a",
    schoolId: "sch-101",
    academicYearId: "ay-2026-101",
    levelName: "Kelas 5",
    rombelName: "Cendekia",
    homeroomTeacherId: "u-3",
    homeroomTeacherName: "Siti Nurhaliza, S.Pd",
  },
  {
    id: "cls-8b",
    schoolId: "sch-101",
    academicYearId: "ay-2026-101",
    levelName: "Kelas 8",
    rombelName: "B",
    homeroomTeacherId: "u-5",
    homeroomTeacherName: "Rina Lestari, S.Pd",
  },
  {
    id: "cls-tk-a",
    schoolId: "sch-102",
    academicYearId: "ay-2026-102",
    levelName: "Kelompok A",
    rombelName: "Bintang",
  },
];

const teachers: MasterTeacherOption[] = [
  { id: "u-3", schoolId: "sch-101", name: "Siti Nurhaliza, S.Pd" },
  { id: "u-5", schoolId: "sch-101", name: "Rina Lestari, S.Pd" },
];

function assertPermission(user: UserProfile, permission: string) {
  if (user.permissions.includes("*")) return;
  if (!user.permissions.includes(permission)) {
    throw new Error("Anda tidak memiliki izin untuk melakukan tindakan ini.");
  }
}

function assertSchoolScope(user: UserProfile, schoolId: string) {
  if (user.role === "super_admin") return;
  if (user.role === "kepala_sekolah" && user.schoolId === schoolId) return;
  throw new Error("Akses sekolah di luar scope pengguna ditolak.");
}

export const schoolMasterService = {
  async listSchools(user: UserProfile): Promise<School[]> {
    await wait();
    assertPermission(user, MASTER_PERMISSIONS.read);
    if (user.role === "super_admin") return [...schools];
    if (user.schoolId) return schools.filter((school) => school.id === user.schoolId);
    return [];
  },

  async createSchool(user: UserProfile, input: CreateSchoolInput): Promise<School> {
    await wait();
    assertPermission(user, MASTER_PERMISSIONS.write);
    if (user.role !== "super_admin") {
      throw new Error("Hanya Super Admin yang dapat membuat sekolah.");
    }
    if (!input.name.trim()) throw new Error("Nama sekolah wajib diisi.");

    const duplicate = schools.some(
      (school) => school.name.trim().toLowerCase() === input.name.trim().toLowerCase(),
    );
    if (duplicate) throw new Error("Nama sekolah sudah digunakan.");

    const school: School = {
      id: `sch-${Date.now()}`,
      name: input.name.trim(),
      timezone: input.timezone,
      status: "active",
    };
    schools = [school, ...schools];
    return school;
  },

  async updateSchool(
    user: UserProfile,
    schoolId: string,
    input: UpdateSchoolInput,
  ): Promise<School> {
    await wait();
    assertPermission(user, MASTER_PERMISSIONS.write);
    assertSchoolScope(user, schoolId);
    if (!input.name.trim()) throw new Error("Nama sekolah wajib diisi.");

    const index = schools.findIndex((school) => school.id === schoolId);
    if (index < 0) throw new Error("Sekolah tidak ditemukan.");

    const duplicate = schools.some(
      (school) => school.id !== schoolId && school.name.trim().toLowerCase() === input.name.trim().toLowerCase(),
    );
    if (duplicate) throw new Error("Nama sekolah sudah digunakan.");

    const updated = { ...schools[index], ...input, name: input.name.trim() };
    schools[index] = updated;
    return updated;
  },

  async listAcademicYears(user: UserProfile, schoolId: string): Promise<AcademicYear[]> {
    await wait();
    assertPermission(user, MASTER_PERMISSIONS.read);
    assertSchoolScope(user, schoolId);
    return academicYears.filter((year) => year.schoolId === schoolId);
  },

  async createAcademicYear(
    user: UserProfile,
    input: CreateAcademicYearInput,
  ): Promise<AcademicYear> {
    await wait();
    assertPermission(user, MASTER_PERMISSIONS.write);
    assertSchoolScope(user, input.schoolId);
    if (!input.name.trim()) throw new Error("Nama tahun ajaran wajib diisi.");
    if (input.endDate <= input.startDate) {
      throw new Error("Tanggal selesai harus setelah tanggal mulai.");
    }

    const duplicate = academicYears.some(
      (year) => year.schoolId === input.schoolId && year.name.toLowerCase() === input.name.trim().toLowerCase(),
    );
    if (duplicate) throw new Error("Tahun ajaran tersebut sudah ada di sekolah ini.");

    if (input.status === "active") {
      academicYears = academicYears.map((year) =>
        year.schoolId === input.schoolId ? { ...year, status: "inactive" } : year,
      );
    }

    const year: AcademicYear = { id: `ay-${Date.now()}`, ...input, name: input.name.trim() };
    academicYears = [year, ...academicYears];
    return year;
  },

  async updateAcademicYear(user: UserProfile, yearId: string, input: UpdateAcademicYearInput): Promise<AcademicYear> {
    await wait(); assertPermission(user, MASTER_PERMISSIONS.write);
    const index = academicYears.findIndex((year) => year.id === yearId); if (index < 0) throw new Error("Tahun ajaran tidak ditemukan.");
    assertSchoolScope(user, academicYears[index].schoolId);
    if (!input.name.trim()) throw new Error("Nama tahun ajaran wajib diisi.");
    if (input.endDate <= input.startDate) throw new Error("Tanggal selesai harus setelah tanggal mulai.");
    const duplicate = academicYears.some((year) => year.id !== yearId && year.schoolId === academicYears[index].schoolId && year.name.toLowerCase() === input.name.trim().toLowerCase());
    if (duplicate) throw new Error("Tahun ajaran tersebut sudah ada di sekolah ini.");
    if (input.status === "active") academicYears = academicYears.map((year) => year.schoolId === academicYears[index].schoolId ? { ...year, status: "inactive" } : year);
    const updated = { ...academicYears[index], ...input, name: input.name.trim() };
    academicYears[index] = updated; return updated;
  },

  async listClassGroups(user: UserProfile, schoolId: string): Promise<ClassGroup[]> {
    await wait();
    assertPermission(user, MASTER_PERMISSIONS.read);
    assertSchoolScope(user, schoolId);
    return classGroups.filter((group) => group.schoolId === schoolId);
  },

  async createClassGroup(
    user: UserProfile,
    input: CreateClassGroupInput,
  ): Promise<ClassGroup> {
    await wait();
    assertPermission(user, MASTER_PERMISSIONS.write);
    assertSchoolScope(user, input.schoolId);
    if (!input.levelName.trim() || !input.rombelName.trim()) {
      throw new Error("Tingkat dan nama rombel wajib diisi.");
    }

    const year = academicYears.find(
      (item) => item.id === input.academicYearId && item.schoolId === input.schoolId,
    );
    if (!year) throw new Error("Tahun ajaran tidak valid untuk sekolah tersebut.");

    const duplicate = classGroups.some(
      (group) =>
        group.schoolId === input.schoolId &&
        group.academicYearId === input.academicYearId &&
        group.levelName.trim().toLowerCase() === input.levelName.trim().toLowerCase() &&
        group.rombelName.trim().toLowerCase() === input.rombelName.trim().toLowerCase(),
    );
    if (duplicate) throw new Error("Kombinasi tingkat dan rombel sudah digunakan.");

    const teacher = input.homeroomTeacherId
      ? teachers.find((item) => item.id === input.homeroomTeacherId && item.schoolId === input.schoolId)
      : undefined;

    if (input.homeroomTeacherId && !teacher) {
      throw new Error("Wali Kelas tidak valid untuk sekolah tersebut.");
    }

    if (teacher) {
      const teacherAlreadyAssigned = classGroups.some(
        (group) =>
          group.schoolId === input.schoolId &&
          group.academicYearId === input.academicYearId &&
          group.homeroomTeacherId === teacher.id,
      );
      if (teacherAlreadyAssigned) {
        throw new Error("Wali Kelas sudah memiliki rombel aktif pada tahun ajaran tersebut.");
      }
    }

    const group: ClassGroup = {
      id: `cls-${Date.now()}`,
      schoolId: input.schoolId,
      academicYearId: input.academicYearId,
      levelName: input.levelName.trim(),
      rombelName: input.rombelName.trim(),
      homeroomTeacherId: teacher?.id,
      homeroomTeacherName: teacher?.name,
    };
    classGroups = [group, ...classGroups];
    return group;
  },

  async updateClassGroup(user: UserProfile, groupId: string, input: UpdateClassGroupInput): Promise<ClassGroup> {
    await wait(); assertPermission(user, MASTER_PERMISSIONS.write);
    const index = classGroups.findIndex((group) => group.id === groupId); if (index < 0) throw new Error("Rombel tidak ditemukan.");
    assertSchoolScope(user, classGroups[index].schoolId);
    if (!input.levelName.trim() || !input.rombelName.trim()) throw new Error("Tingkat dan nama rombel wajib diisi.");
    const year = academicYears.find((item) => item.id === input.academicYearId && item.schoolId === classGroups[index].schoolId); if (!year) throw new Error("Tahun ajaran tidak valid.");
    const duplicate = classGroups.some((group) => group.id !== groupId && group.schoolId === classGroups[index].schoolId && group.academicYearId === input.academicYearId && group.levelName.toLowerCase() === input.levelName.trim().toLowerCase() && group.rombelName.toLowerCase() === input.rombelName.trim().toLowerCase());
    if (duplicate) throw new Error("Kombinasi tingkat dan rombel sudah digunakan.");
    const teacher = input.homeroomTeacherId ? teachers.find((item) => item.id === input.homeroomTeacherId && item.schoolId === classGroups[index].schoolId) : undefined;
    if (input.homeroomTeacherId && !teacher) throw new Error("Wali Kelas tidak valid untuk sekolah tersebut.");
    if (teacher && classGroups.some((group) => group.id !== groupId && group.schoolId === classGroups[index].schoolId && group.academicYearId === input.academicYearId && group.homeroomTeacherId === teacher.id)) throw new Error("Wali Kelas sudah memiliki rombel aktif pada tahun ajaran tersebut.");
    const updated = { ...classGroups[index], ...input, levelName: input.levelName.trim(), rombelName: input.rombelName.trim(), homeroomTeacherId: teacher?.id, homeroomTeacherName: teacher?.name };
    classGroups[index] = updated; return updated;
  },

  async listTeachers(user: UserProfile, schoolId: string): Promise<MasterTeacherOption[]> {
    await wait();
    assertPermission(user, MASTER_PERMISSIONS.read);
    assertSchoolScope(user, schoolId);
    return teachers.filter((teacher) => teacher.schoolId === schoolId);
  },
};
