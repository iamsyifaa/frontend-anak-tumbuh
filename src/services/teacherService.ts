import { UserProfile } from "../types/auth";
import { CreateTeacherInput, Teacher, UpdateTeacherInput } from "../types/teacher";
import { schoolMasterService } from "./schoolMasterService";

export const TEACHER_PERMISSIONS = {
  read: "read:teachers",
  write: "write:teachers",
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
};
