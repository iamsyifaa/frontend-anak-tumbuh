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

const sha256 = async (value: string) => {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `mock-hash-${value.length}-${Date.now()}`;
};

export const studentAccountService = {
  async bulkGenerate(user: UserProfile, request: AccountGenerationRequest): Promise<BulkGenerationResult> {
    await wait();
    assertPermission(user);
    assertScope(user, request.schoolId);

    const students = await studentService.listStudents(user, request.schoolId);
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

    const skippedAlreadyGenerated = targets.filter((student) => student.qrStatus === "active" && student.accountStatus === "generated").length;
    const toGenerate = targets.filter((student) => !(student.qrStatus === "active" && student.accountStatus === "generated"));

    const credentials: GeneratedQrCredential[] = [];
    const generated: Student[] = [];
    const groups = (await studentService.listImportContext(user, request.schoolId)).groups;

    for (const student of toGenerate) {
      const token = randomToken(student.id);
      // Only the digest would be persisted by a real backend. The raw credential exists in this response only for the print session.
      await sha256(token);
      const group = groups.find((item) => item.id === student.classGroupId);
      credentials.push({
        studentId: student.id,
        studentName: student.name,
        schoolId: student.schoolId,
        academicYearId: student.academicYearId,
        classGroupId: student.classGroupId,
        levelName: group?.levelName ?? "—",
        rombelName: group?.rombelName ?? "—",
        qrToken: token,
        generatedAt: new Date().toISOString(),
      });
      generated.push({ ...student, accountStatus: "generated", qrStatus: "active" });
    }

    return { generated, skippedManual, skippedAlreadyGenerated, credentials };
  },

  async revoke(user: UserProfile, student: Student) {
    await wait();
    assertPermission(user);
    assertScope(user, student.schoolId);
    if (student.method !== "DIGITAL") throw new Error("Siswa MANUAL tidak memiliki credential QR.");
    if (student.qrStatus !== "active") throw new Error("QR siswa tidak sedang aktif.");
    return { ...student, qrStatus: "revoked" as const };
  },
};
