import { UserProfile } from "../types/auth";
import { CreateTeacherInput, ImportTeacherRow, Teacher, TeacherCreateResult, TeacherGeneratedCredential, TeacherStatus, UpdateTeacherInput, ValidatedTeacherImportRow } from "../types/teacher";
import { schoolMasterService } from "./schoolMasterService";

export const TEACHER_PERMISSIONS = {
  read: "read:teachers",
  write: "write:teachers",
  import: "import:teachers",
} as const;

const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

let teachers: Teacher[] = [
  { id: "u-3", schoolId: "sch-101", name: "Siti Nurhaliza, S.Pd", username: "sitinurhaliza", password: "siti1", status: "active", classGroupId: "cls-5a", classGroupName: "Kelas 5 — Cendekia" },
  { id: "u-5", schoolId: "sch-101", name: "Rina Lestari, S.Pd", username: "rinalestari", password: "rina2", status: "active", classGroupId: "cls-8b", classGroupName: "Kelas 8 — B" },
];
let credentialSequence = 1;
const issuedPasswords = new Set<string>();
const mockTeacherCredentials = new Map<string, string>(teachers.map((teacher) => [teacher.username.toLowerCase(), teacher.password]));

function assertPermission(user: UserProfile, permission: string) {
  if (user.permissions.includes("*") || user.permissions.includes(permission)) return;
  throw new Error("Anda tidak memiliki izin untuk melakukan tindakan ini.");
}
function assertScope(user: UserProfile, schoolId: string) {
  if (user.role === "super_admin" || (user.role === "kepala_sekolah" && user.schoolId === schoolId)) return;
  throw new Error("Akses guru di luar scope pengguna ditolak.");
}

const normalizeName = (value: string) => value
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "")
  .trim();

const firstName = (value: string) => normalizeName(value.split(/[ ,.-]/)[0] || "guru") || "guru";

function createUniqueUsername(name: string) {
  const base = normalizeName(name) || "guru";
  let username = base;
  let counter = 2;
  while (teachers.some((teacher) => teacher.username.toLowerCase() === username.toLowerCase())) username = `${base}${counter++}`;
  return username;
}

function createUniquePassword(name: string) {
  const first = firstName(name);
  let password = `${first}${credentialSequence}`;
  while (issuedPasswords.has(password) || teachers.some((teacher) => mockTeacherCredentials.has(teacher.username.toLowerCase()) && mockTeacherCredentials.get(teacher.username.toLowerCase()) === password)) {
    credentialSequence += 1;
    password = `${first}${credentialSequence}`;
  }
  issuedPasswords.add(password);
  credentialSequence += 1;
  return password;
}

export const findMockTeacherCredential = (username: string) => {
  const normalized = username.trim().toLowerCase();
  const teacher = teachers.find((item) => item.username.toLowerCase() === normalized && item.status === "active");
  const password = mockTeacherCredentials.get(normalized);
  if (!teacher || !password) return null;
  return { teacher, password };
};

async function resolveClassGroup(user: UserProfile, schoolId: string, classGroupId?: string) {
  if (!classGroupId) return { id: undefined as string | undefined, name: undefined as string | undefined };
  const groups = await schoolMasterService.listClassGroups(user, schoolId);
  const group = groups.find((g) => g.id === classGroupId);
  if (!group) throw new Error("Rombel tidak valid.");
  return { id: group.id, name: `${group.levelName} — ${group.rombelName}` };
}

export const teacherService = {
  async list(user: UserProfile, schoolId: string) {
    await wait(); assertPermission(user, TEACHER_PERMISSIONS.read); assertScope(user, schoolId);
    return teachers.filter((teacher) => teacher.schoolId === schoolId).map((teacher) => ({ ...teacher }));
  },

  async create(user: UserProfile, input: CreateTeacherInput): Promise<TeacherCreateResult> {
    await wait(); assertPermission(user, TEACHER_PERMISSIONS.write); assertScope(user, input.schoolId);
    if (!input.name.trim()) throw new Error("Nama guru wajib diisi.");
    const group = await resolveClassGroup(user, input.schoolId, input.classGroupId);
    const username = createUniqueUsername(input.name);
    const temporaryPassword = createUniquePassword(input.name);
    const teacher: Teacher = {
      id: `teacher-${Date.now()}`,
      schoolId: input.schoolId,
      name: input.name.trim(),
      username,
      password: temporaryPassword,
      status: input.status,
      classGroupId: group.id,
      classGroupName: group.name,
    };
    teachers = [teacher, ...teachers];
    mockTeacherCredentials.set(username.toLowerCase(), temporaryPassword);
    await schoolMasterService.registerTeacherOption(user, { id: teacher.id, schoolId: teacher.schoolId, name: teacher.name });
    if (teacher.classGroupId) await schoolMasterService.assignHomeroomTeacher(user, teacher.classGroupId, teacher.id);
    return { teacher, credential: { teacherId: teacher.id, teacherName: teacher.name, username, temporaryPassword, classGroupName: teacher.classGroupName } };
  },

  async update(user: UserProfile, teacherId: string, input: UpdateTeacherInput) {
    await wait(); assertPermission(user, TEACHER_PERMISSIONS.write);
    const index = teachers.findIndex((teacher) => teacher.id === teacherId);
    if (index < 0) throw new Error("Guru tidak ditemukan.");
    assertScope(user, teachers[index].schoolId);
    if (!input.name.trim()) throw new Error("Nama guru wajib diisi.");
    const username = normalizeName(input.username);
    if (!username) throw new Error("Username wajib diisi.");
    if (teachers.some((teacher) => teacher.id !== teacherId && teacher.username.toLowerCase() === username.toLowerCase())) throw new Error("Username sudah digunakan guru lain.");
    const group = await resolveClassGroup(user, input.schoolId, input.classGroupId);
    const previous = teachers[index];
    mockTeacherCredentials.delete(previous.username.toLowerCase());
    mockTeacherCredentials.set(username.toLowerCase(), previous.password);
    const updated = { ...previous, ...input, username, name: input.name.trim(), password: previous.password, classGroupId: group.id, classGroupName: group.name };
    teachers[index] = updated;
    return { ...updated };
  },

  async delete(user: UserProfile, teacherId: string) {
    await wait();
    assertPermission(user, TEACHER_PERMISSIONS.write);
    const teacher = teachers.find((item) => item.id === teacherId);
    if (!teacher) throw new Error("Guru tidak ditemukan.");
    assertScope(user, teacher.schoolId);
    const groups = await schoolMasterService.listClassGroups(user, teacher.schoolId);
    for (const group of groups.filter((item) => item.homeroomTeacherId === teacher.id)) {
      await schoolMasterService.assignHomeroomTeacher(user, group.id, undefined);
    }
    mockTeacherCredentials.delete(teacher.username.toLowerCase());
    teachers = teachers.filter((item) => item.id !== teacherId);
    return { id: teacherId };
  },

  async validateImport(user: UserProfile, schoolId: string, rows: ImportTeacherRow[]): Promise<ValidatedTeacherImportRow[]> {
    await wait(); assertPermission(user, TEACHER_PERMISSIONS.import); assertScope(user, schoolId);
    const groups = await schoolMasterService.listClassGroups(user, schoolId);
    const plannedUsernames = new Set(teachers.map((teacher) => teacher.username.toLowerCase()));
    return rows.map((row) => {
      const errors: string[] = [];
      if (!row.name.trim()) errors.push("Nama guru wajib diisi.");
      if (row.status && !["active", "inactive"].includes(row.status)) errors.push("Status harus Aktif atau Nonaktif.");
      let generatedUsername = "";
      let generatedPassword = "";
      if (row.name.trim()) {
        const base = normalizeName(row.name) || "guru";
        generatedUsername = base;
        if (plannedUsernames.has(generatedUsername)) {
          let suffix = 2;
          while (plannedUsernames.has(`${base}${suffix}`)) suffix += 1;
          generatedUsername = `${base}${suffix}`;
        }
        plannedUsernames.add(generatedUsername);
        generatedPassword = createUniquePassword(row.name);
      }
      let classGroupId: string | undefined;
      if (row.levelName || row.rombelName) {
        const group = groups.find((item) => item.levelName.trim().toLowerCase() === (row.levelName ?? "").trim().toLowerCase() && item.rombelName.trim().toLowerCase() === (row.rombelName ?? "").trim().toLowerCase());
        if (!group) errors.push("Tingkat/rombel tidak valid untuk sekolah ini.");
        classGroupId = group?.id;
      }
      return { ...row, valid: errors.length === 0, classGroupId, errors, generatedUsername, generatedPassword };
    });
  },

  async commitImport(user: UserProfile, schoolId: string, rows: ValidatedTeacherImportRow[]): Promise<{ imported: number; credentials: TeacherGeneratedCredential[] }> {
    await wait(); assertPermission(user, TEACHER_PERMISSIONS.import); assertScope(user, schoolId);
    if (!rows.length) throw new Error("Tidak ada data guru untuk diimport.");
    if (rows.some((row) => !row.valid || !row.generatedUsername || !row.generatedPassword)) throw new Error("Import guru ditolak karena masih ada baris yang tidak valid.");
    const groups = await schoolMasterService.listClassGroups(user, schoolId);
    const imported: Teacher[] = [];
    const credentials: TeacherGeneratedCredential[] = [];
    for (const row of rows) {
      const group = row.classGroupId ? groups.find((item) => item.id === row.classGroupId) : undefined;
      const teacherId = `teacher-import-${Date.now()}-${imported.length}`;
      const teacher: Teacher = {
        id: teacherId, schoolId, name: row.name.trim(), username: row.generatedUsername!, password: row.generatedPassword!, status: (row.status || "active") as TeacherStatus,
        classGroupId: group?.id, classGroupName: group ? `${group.levelName} — ${group.rombelName}` : undefined,
      };
      imported.push(teacher);
      credentials.push({ teacherId, teacherName: teacher.name, username: teacher.username, temporaryPassword: row.generatedPassword!, classGroupName: teacher.classGroupName });
      mockTeacherCredentials.set(teacher.username.toLowerCase(), row.generatedPassword!);
    }
    teachers = [...imported, ...teachers];
    for (const teacher of imported) {
      await schoolMasterService.registerTeacherOption(user, { id: teacher.id, schoolId: teacher.schoolId, name: teacher.name });
      if (teacher.classGroupId) await schoolMasterService.assignHomeroomTeacher(user, teacher.classGroupId, teacher.id);
    }
    return { imported: imported.length, credentials };
  },
};
