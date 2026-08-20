import { UserProfile } from "../types/auth";
import { Student } from "../types/student";
import { AccountGenerationRequest, BulkGenerationResult, GeneratedQrCredential } from "../types/studentAccount";
import { studentService, STUDENT_PERMISSIONS } from "./studentService";
import { schoolMasterService } from "./schoolMasterService";

const wait = (ms = 320) => new Promise((resolve) => setTimeout(resolve, ms));

const assertPermission = (user: UserProfile) => {
  if (user.permissions.includes("*") || user.permissions.includes(STUDENT_PERMISSIONS.generateQr)) return;
  throw new Error("Anda tidak memiliki izin untuk mengelola akun siswa.");
};

const assertScope = (user: UserProfile, schoolId: string) => {
  if (user.role === "super_admin") return;
  if (user.role === "kepala_sekolah" && user.schoolId === schoolId) return;
  throw new Error("Akses akun siswa di luar scope pengguna ditolak.");
};

const randomToken = (studentId: string) => {
  const bytes = new Uint8Array(18);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  return `mock-student-qr-${studentId}-${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
};

// Mock-only: raw credentials stay in this in-memory session map so already-generated
// students can be printed again during the same frontend session. Production must never persist raw QR credentials here.
const mockCredentialSession = new Map<string, GeneratedQrCredential>();

const createCredential = (student: Student, token: string, groups: Awaited<ReturnType<typeof schoolMasterService.listClassGroups>>): GeneratedQrCredential => {
  const group = groups.find((item) => item.id === student.classGroupId);
  return {
    studentId: student.id, studentName: student.name, schoolId: student.schoolId, academicYearId: student.academicYearId, classGroupId: student.classGroupId,
    levelName: group?.levelName ?? "—", rombelName: group?.rombelName ?? "—", qrToken: token, generatedAt: new Date().toISOString(),
  };
};

const seedMockCredential = (student: Student, groups: Awaited<ReturnType<typeof schoolMasterService.listClassGroups>>) => {
  if (student.id === "stu-001" && !mockCredentialSession.has(student.id)) {
    mockCredentialSession.set(student.id, createCredential(student, `mock-student-qr-${student.id}-00112233445566778899aabbccddeeff`, groups));
  }
};

export const studentAccountService = {
  async bulkGenerate(user: UserProfile, request: AccountGenerationRequest): Promise<BulkGenerationResult> {
    await wait();
    assertPermission(user);
    assertScope(user, request.schoolId);

    const students = await studentService.listStudents(user, request.schoolId);
    const groups = (await studentService.listImportContext(user, request.schoolId)).groups;
    students.filter((student) => student.status === "active" && student.method === "DIGITAL" && student.accountStatus === "generated" && student.qrStatus === "active").forEach((student) => seedMockCredential(student, groups));

    let targets = students.filter((student) => student.status === "active" && student.method === "DIGITAL");
    if (request.scope === "ACADEMIC_YEAR") targets = targets.filter((student) => student.academicYearId === request.academicYearId);
    if (request.scope === "CLASS_GROUP") targets = targets.filter((student) => student.classGroupId === request.classGroupId);
    if (request.scope === "SELECTED") targets = targets.filter((student) => request.studentIds?.includes(student.id));

    const skippedManual = students.filter((student) => {
      if (request.scope === "SELECTED") return request.studentIds?.includes(student.id) && student.method === "MANUAL";
      if (request.scope === "CLASS_GROUP") return student.classGroupId === request.classGroupId && student.method === "MANUAL";
      if (request.scope === "ACADEMIC_YEAR") return student.academicYearId === request.academicYearId && student.method === "MANUAL";
      return student.method === "MANUAL";
    }).length;

    const generated: Student[] = [];
    const credentials: GeneratedQrCredential[] = [];
    let skippedAlreadyGenerated = 0;
    for (const student of targets) {
      if (student.qrStatus === "active" && student.accountStatus === "generated") {
        const existing = mockCredentialSession.get(student.id);
        if (existing) credentials.push(existing);
        else skippedAlreadyGenerated += 1;
        continue;
      }
      const token = randomToken(student.id);
      const credential = createCredential(student, token, groups);
      mockCredentialSession.set(student.id, credential);
      credentials.push(credential);
      generated.push({ ...student, accountStatus: "generated", qrStatus: "active" });
    }

    // Mock response mirrors backend state change so the UI stays consistent after generation.
    if (generated.length) {
      const byId = new Map(generated.map((student) => [student.id, student]));
      // studentService owns the authoritative mock list; update through its existing endpoint.
      for (const student of generated) await studentService.generateQr(user, student.id);
      const normalizedGenerated = generated.map((student) => byId.get(student.id) ?? student);
      return { generated: normalizedGenerated, skippedManual, skippedAlreadyGenerated, credentials };
    }

    return { generated: [], skippedManual, skippedAlreadyGenerated, credentials };
  },

  async revoke(user: UserProfile, student: Student) {
    await wait(); assertPermission(user); assertScope(user, student.schoolId);
    if (student.method !== "DIGITAL") throw new Error("Siswa MANUAL tidak memiliki credential QR.");
    if (student.qrStatus !== "active") throw new Error("QR siswa tidak sedang aktif.");
    mockCredentialSession.delete(student.id);
    return studentService.revokeQr(user, student.id);
  },

  async clearSessionCredential(studentId: string) {
    mockCredentialSession.delete(studentId);
  },
};
