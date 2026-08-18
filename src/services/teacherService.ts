import { UserProfile } from "../types/auth";
import { CreateTeacherInput, ImportTeacherRow, Teacher, TeacherStatus, UpdateTeacherInput, ValidatedTeacherImportRow } from "../types/teacher";
import { schoolMasterService } from "./schoolMasterService";

export const TEACHER_PERMISSIONS = {
  read: "read:teachers",
  write: "write:teachers",
  import: "import:teachers",
} as const;

const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

let teachers: Teacher[] = [
  { id: "u-3", schoolId: "sch-101", name: "Siti Nurhaliza, S.Pd", username: "siti.nurhaliza", status: "active", classGroupId: "cls-5a", classGroupName: "Kelas 5 — Cendekia" },
  { id: "u-5", schoolId: "sch-101", name: "Rina Lestari, S.Pd", username: "rina.lestari", status: "active", classGroupId: "cls-8b", classGroupName: "Kelas 8 — B" },
];

function assertPermission(user: UserProfile, permission: string) {
  if (user.permissions.includes("*") || user.permissions.includes(permission)) return;
  throw new Error("Anda tidak memiliki izin untuk melakukan tindakan ini.");
}
function assertScope(user: UserProfile, schoolId: string) {
  if (user.role === "super_admin" || (user.role === "kepala_sekolah" && user.schoolId === schoolId)) return;
  throw new Error("Akses guru di luar scope pengguna ditolak.");
}

export const teacherService = {
  async list(user: UserProfile, schoolId: string) {
    await wait(); assertPermission(user, TEACHER_PERMISSIONS.read); assertScope(user, schoolId);
    return teachers.filter((teacher) => teacher.schoolId === schoolId);
  },
  async create(user: UserProfile, input: CreateTeacherInput) {
    await wait(); assertPermission(user, TEACHER_PERMISSIONS.write); assertScope(user, input.schoolId);
    if (!input.name.trim()) throw new Error("Nama guru wajib diisi.");
    if (!input.username.trim()) throw new Error("Username wajib diisi.");
    if (teachers.some((t) => t.username.toLowerCase() === input.username.trim().toLowerCase())) throw new Error("Username sudah digunakan.");
    const teacher: Teacher = { id: `teacher-${Date.now()}`, schoolId: input.schoolId, name: input.name.trim(), username: input.username.trim(), status: input.status };
    teachers = [teacher, ...teachers]; return teacher;
  },
  async update(user: UserProfile, teacherId: string, input: UpdateTeacherInput) {
    await wait(); assertPermission(user, TEACHER_PERMISSIONS.write);
    const index = teachers.findIndex((teacher) => teacher.id === teacherId); if (index < 0) throw new Error("Guru tidak ditemukan.");
    assertScope(user, teachers[index].schoolId); if (!input.name.trim() || !input.username.trim()) throw new Error("Nama dan username wajib diisi.");
    if (teachers.some((t) => t.id !== teacherId && t.username.toLowerCase() === input.username.trim().toLowerCase())) throw new Error("Username sudah digunakan.");
    let classGroupName: string | undefined;
    if (input.classGroupId) {
      const groups = await schoolMasterService.listClassGroups(user, input.schoolId);
      const group = groups.find((g) => g.id === input.classGroupId);
      if (!group) throw new Error("Rombel tidak valid.");
      classGroupName = `${group.levelName} — ${group.rombelName}`;
    }
    const updated = { ...teachers[index], ...input, name: input.name.trim(), username: input.username.trim(), classGroupName };
    teachers[index] = updated; return updated;
  },
  async validateImport(user: UserProfile, schoolId: string, rows: ImportTeacherRow[]): Promise<ValidatedTeacherImportRow[]> {
    await wait(); assertPermission(user, TEACHER_PERMISSIONS.import); assertScope(user, schoolId);
    const groups = await schoolMasterService.listClassGroups(user, schoolId);
    const seen = new Set<string>();
    return rows.map((row) => {
      const errors: string[] = [];
      const username = row.username.trim().toLowerCase();
      if (!row.name.trim()) errors.push("Nama guru wajib diisi.");
      if (!username) errors.push("Username wajib diisi.");
      if (row.status && !["active", "inactive"].includes(row.status)) errors.push("Status harus Aktif atau Nonaktif.");
      if (username && seen.has(username)) errors.push("Username duplikat di dalam file.");
      if (username && teachers.some((teacher) => teacher.username.toLowerCase() === username)) errors.push("Username sudah digunakan.");
      if (username) seen.add(username);

      let classGroupId: string | undefined;
      if (row.levelName || row.rombelName) {
        const group = groups.find((item) => item.levelName.trim().toLowerCase() === (row.levelName ?? "").trim().toLowerCase() && item.rombelName.trim().toLowerCase() === (row.rombelName ?? "").trim().toLowerCase());
        if (!group) errors.push("Tingkat/rombel tidak valid untuk sekolah ini.");
        classGroupId = group?.id;
      }
      return { ...row, valid: errors.length === 0, classGroupId, errors };
    });
  },

  async commitImport(user: UserProfile, schoolId: string, rows: ValidatedTeacherImportRow[]): Promise<{ imported: number }> {
    await wait(); assertPermission(user, TEACHER_PERMISSIONS.import); assertScope(user, schoolId);
    if (!rows.length) throw new Error("Tidak ada data guru untuk diimport.");
    const invalid = rows.find((row) => !row.valid);
    if (invalid) throw new Error("Import guru ditolak karena masih ada baris yang tidak valid.");
    const usernames = new Set(teachers.map((teacher) => teacher.username.toLowerCase()));
    for (const row of rows) {
      const username = row.username.trim().toLowerCase();
      if (usernames.has(username)) throw new Error(`Import ditolak: username ${row.username} sudah terdaftar.`);
      usernames.add(username);
    }
    const groups = await schoolMasterService.listClassGroups(user, schoolId);
    const imported = rows.map((row, index) => {
      const group = row.classGroupId ? groups.find((item) => item.id === row.classGroupId) : undefined;
      return {
        id: `teacher-import-${Date.now()}-${index}`,
        schoolId,
        name: row.name.trim(),
        username: row.username.trim(),
        status: (row.status || "active") as TeacherStatus,
        classGroupId: group?.id,
        classGroupName: group ? `${group.levelName} — ${group.rombelName}` : undefined,
      };
    });
    teachers = [...imported, ...teachers];
    return { imported: imported.length };
  },

};
