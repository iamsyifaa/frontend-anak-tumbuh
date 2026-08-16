import { UserProfile } from "../types/auth";
import { ClassGroup } from "../types/school";
import {
  CreateStudentInput,
  ImportStudentError,
  ImportStudentRow,
  Student,
  StudentMethod,
  StudentStatus,
  ValidatedImportRow,
} from "../types/student";
import { schoolMasterService } from "./schoolMasterService";
import { collectImportIdentityErrors } from "./studentImportValidation";

export const STUDENT_PERMISSIONS = {
  read: "read:students",
  write: "write:students",
  import: "import:students",
  generateQr: "generate:student_qr",
} as const;

const wait = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

let students: Student[] = [
  {
    id: "stu-001",
    schoolId: "sch-101",
    academicYearId: "ay-2026-101",
    classGroupId: "cls-5a",
    name: "Ahmad Rizky",
    nisn: "0098765432",
    nis: "25001",
    method: "DIGITAL",
    status: "active",
    accountStatus: "generated",
    qrStatus: "active",
    createdAt: "2026-07-01T08:00:00.000Z",
  },
  {
    id: "stu-002",
    schoolId: "sch-101",
    academicYearId: "ay-2026-101",
    classGroupId: "cls-5a",
    name: "Bintang Pratama",
    nisn: "0098765433",
    nis: "25002",
    method: "MANUAL",
    status: "active",
    accountStatus: "not_generated",
    qrStatus: "not_available",
    createdAt: "2026-07-01T08:10:00.000Z",
  },
  {
    id: "stu-003",
    schoolId: "sch-101",
    academicYearId: "ay-2026-101",
    classGroupId: "cls-8b",
    name: "Citra Lestari",
    nisn: "0098765434",
    nis: "25003",
    method: "DIGITAL",
    status: "active",
    accountStatus: "not_generated",
    qrStatus: "not_available",
    createdAt: "2026-07-01T08:20:00.000Z",
  },
  {
    id: "stu-004",
    schoolId: "sch-102",
    academicYearId: "ay-2026-102",
    classGroupId: "cls-tk-a",
    name: "Daffa Ceria",
    nis: "TK-001",
    method: "MANUAL",
    status: "active",
    accountStatus: "not_generated",
    qrStatus: "not_available",
    createdAt: "2026-07-02T08:00:00.000Z",
  },
];

const assertPermission = (user: UserProfile, permission: string) => {
  if (user.permissions.includes("*") || user.permissions.includes(permission)) return;
  throw new Error("Anda tidak memiliki izin untuk melakukan tindakan ini.");
};

const assertSchoolScope = (user: UserProfile, schoolId: string) => {
  if (user.role === "super_admin") return;
  if (user.role === "kepala_sekolah" && user.schoolId === schoolId) return;
  throw new Error("Akses siswa di luar scope pengguna ditolak.");
};

const normalize = (value?: string) => value?.trim().toLowerCase() ?? "";

function validateIdentityUniqueness(input: { schoolId: string; nisn?: string; nis?: string }, ignoreId?: string) {
  if (input.nisn && students.some((student) => student.id !== ignoreId && student.schoolId === input.schoolId && student.nisn === input.nisn)) {
    throw new Error("NISN sudah digunakan pada sekolah ini.");
  }
  if (input.nis && students.some((student) => student.id !== ignoreId && student.schoolId === input.schoolId && student.nis === input.nis)) {
    throw new Error("NIS/Nomor Induk sudah digunakan pada sekolah ini.");
  }
}

async function getClassGroups(user: UserProfile, schoolId: string) {
  return schoolMasterService.listClassGroups(user, schoolId);
}

export const studentService = {
  async listStudents(user: UserProfile, schoolId: string): Promise<Student[]> {
    await wait();
    assertPermission(user, STUDENT_PERMISSIONS.read);
    assertSchoolScope(user, schoolId);
    return students.filter((student) => student.schoolId === schoolId);
  },

  async createStudent(user: UserProfile, input: CreateStudentInput): Promise<Student> {
    await wait();
    assertPermission(user, STUDENT_PERMISSIONS.write);
    assertSchoolScope(user, input.schoolId);
    if (!input.name.trim()) throw new Error("Nama siswa wajib diisi.");
    if (!input.nisn && !input.nis) throw new Error("NISN atau NIS wajib diisi.");
    if (!["DIGITAL", "MANUAL"].includes(input.method)) throw new Error("Metode pengisian harus DIGITAL atau MANUAL.");

    const groups = await getClassGroups(user, input.schoolId);
    const group = groups.find((item) => item.id === input.classGroupId && item.academicYearId === input.academicYearId);
    if (!group) throw new Error("Kelas/rombel tidak valid untuk sekolah dan tahun ajaran tersebut.");
    validateIdentityUniqueness(input);

    const student: Student = {
      id: `stu-${Date.now()}`,
      schoolId: input.schoolId,
      academicYearId: input.academicYearId,
      classGroupId: input.classGroupId,
      name: input.name.trim(),
      nisn: input.nisn?.trim() || undefined,
      nis: input.nis?.trim() || undefined,
      method: input.method,
      status: input.status,
      accountStatus: "not_generated",
      qrStatus: "not_available",
      createdAt: new Date().toISOString(),
    };
    students = [student, ...students];
    return student;
  },

  async updateStudent(user: UserProfile, studentId: string, input: CreateStudentInput): Promise<Student> {
    await wait();
    assertPermission(user, STUDENT_PERMISSIONS.write);
    const index = students.findIndex((student) => student.id === studentId);
    if (index < 0) throw new Error("Siswa tidak ditemukan.");
    assertSchoolScope(user, students[index].schoolId);
    if (!input.name.trim()) throw new Error("Nama siswa wajib diisi.");
    if (!input.nisn && !input.nis) throw new Error("NISN atau NIS wajib diisi.");
    if (!["DIGITAL", "MANUAL"].includes(input.method)) throw new Error("Metode pengisian harus DIGITAL atau MANUAL.");
    const groups = await getClassGroups(user, input.schoolId);
    const group = groups.find((item) => item.id === input.classGroupId && item.academicYearId === input.academicYearId);
    if (!group) throw new Error("Kelas/rombel tidak valid untuk sekolah dan tahun ajaran tersebut.");
    validateIdentityUniqueness(input, studentId);
    const previous = students[index];
    const updated: Student = {
      ...previous,
      ...input,
      name: input.name.trim(),
      nisn: input.nisn?.trim() || undefined,
      nis: input.nis?.trim() || undefined,
      qrStatus: input.method === "DIGITAL" ? previous.qrStatus : "not_available",
      accountStatus: input.method === "DIGITAL" ? previous.accountStatus : "not_generated",
    };
    students[index] = updated;
    return updated;
  },

  async generateQr(user: UserProfile, studentId: string): Promise<Student> {
    await wait();
    assertPermission(user, STUDENT_PERMISSIONS.generateQr);
    const index = students.findIndex((student) => student.id === studentId);
    if (index < 0) throw new Error("Siswa tidak ditemukan.");
    assertSchoolScope(user, students[index].schoolId);
    if (students[index].method !== "DIGITAL") throw new Error("QR hanya dapat dibuat untuk siswa dengan metode DIGITAL.");
    const updated = { ...students[index], accountStatus: "generated" as const, qrStatus: "active" as const };
    students[index] = updated;
    return updated;
  },

  async revokeQr(user: UserProfile, studentId: string): Promise<Student> {
    await wait();
    assertPermission(user, STUDENT_PERMISSIONS.generateQr);
    const index = students.findIndex((student) => student.id === studentId);
    if (index < 0) throw new Error("Siswa tidak ditemukan.");
    assertSchoolScope(user, students[index].schoolId);
    const updated = { ...students[index], qrStatus: "revoked" as const };
    students[index] = updated;
    return updated;
  },

  async validateImport(user: UserProfile, schoolId: string, academicYearId: string, rows: ImportStudentRow[]): Promise<ValidatedImportRow[]> {
    await wait();
    assertPermission(user, STUDENT_PERMISSIONS.import);
    assertSchoolScope(user, schoolId);
    const groups = await getClassGroups(user, schoolId);
    const targetGroups = groups.filter((group) => group.academicYearId === academicYearId);
    const seenNisn = new Set<string>();
    const seenNis = new Set<string>();

    return rows.map((row) => {
      const errors = collectImportIdentityErrors(row, students, seenNisn, seenNis, schoolId);

      const group = targetGroups.find((item) => normalize(item.levelName) === normalize(row.levelName) && normalize(item.rombelName) === normalize(row.rombelName));
      if (!group) errors.push({ rowNumber: row.rowNumber, field: "level/rombel", code: "scope", message: "Tingkat/rombel tidak valid untuk sekolah dan tahun ajaran yang dipilih." });

      return {
        ...row,
        valid: errors.length === 0,
        classGroupId: group?.id,
        academicYearId: group?.academicYearId,
        errors,
      };
    });
  },

  async commitImport(user: UserProfile, schoolId: string, rows: ValidatedImportRow[]): Promise<{ imported: number }> {
    await wait();
    assertPermission(user, STUDENT_PERMISSIONS.import);
    assertSchoolScope(user, schoolId);
    const invalid = rows.find((row) => !row.valid);
    if (invalid) throw new Error("Import ditolak karena masih ada baris yang tidak valid.");
    if (!rows.length) throw new Error("Tidak ada data valid untuk diimport.");

    const existingNisn = new Set(students.filter((student) => student.schoolId === schoolId).map((student) => student.nisn).filter(Boolean));
    const existingNis = new Set(students.filter((student) => student.schoolId === schoolId).map((student) => student.nis).filter(Boolean));
    for (const row of rows) {
      if (row.nisn && existingNisn.has(row.nisn)) throw new Error(`Import ditolak: NISN ${row.nisn} sudah terdaftar.`);
      if (row.nis && existingNis.has(row.nis)) throw new Error(`Import ditolak: NIS ${row.nis} sudah terdaftar.`);
      if (row.nisn) existingNisn.add(row.nisn);
      if (row.nis) existingNis.add(row.nis);
    }

    const now = new Date().toISOString();
    const imported = rows.map((row, index) => ({
      id: `stu-import-${Date.now()}-${index}`,
      schoolId,
      academicYearId: row.academicYearId!,
      classGroupId: row.classGroupId!,
      name: row.name.trim(),
      nisn: row.nisn?.trim() || undefined,
      nis: row.nis?.trim() || undefined,
      method: row.method as StudentMethod,
      status: "active" as StudentStatus,
      accountStatus: "not_generated" as const,
      qrStatus: "not_available" as const,
      createdAt: now,
    }));
    students = [...imported, ...students];
    return { imported: imported.length };
  },

  async listImportContext(user: UserProfile, schoolId: string) {
    assertPermission(user, STUDENT_PERMISSIONS.read);
    assertSchoolScope(user, schoolId);
    const [years, groups] = await Promise.all([
      schoolMasterService.listAcademicYears(user, schoolId),
      schoolMasterService.listClassGroups(user, schoolId),
    ]);
    return { years, groups };
  },

};
