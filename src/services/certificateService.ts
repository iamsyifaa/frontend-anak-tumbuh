import { UserProfile } from "../types/auth";
import {
  CertificateIssueRequest,
  CertificateManagementContext,
  CertificateTemplate,
  IssuedCertificate,
  WaliCertificateContext,
} from "../types/certificate";
import { studentService } from "./studentService";
import { schoolMasterService } from "./schoolMasterService";
import { teacherService } from "./teacherService";

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => new Date().toISOString();

let templates: CertificateTemplate[] = [
  {
    id: "cert-template-1",
    name: "Sertifikat Kebiasaan Hebat",
    titleTemplate: "Sertifikat Pencapaian {student}",
    descriptionTemplate:
      "Diberikan kepada {student} atas pencapaian kebiasaan {habit} pada periode {period}.",
    issuerRoleLabel: "Kepala Sekolah",
    active: true,
    version: 1,
    updatedAt: now(),
  },
  {
    id: "cert-template-2",
    name: "Piagam Penghargaan Siswa",
    titleTemplate: "Piagam Penghargaan {student}",
    descriptionTemplate: "Penghargaan untuk {student} pada periode {period}.",
    issuerRoleLabel: "Kepala Sekolah",
    active: true,
    version: 1,
    updatedAt: now(),
    templateCode: "classic-blue-gold",
  },
];

let issued: IssuedCertificate[] = [
  {
    id: "issued-cert-1",
    certificateNumber: "CERT/AT-ID/2026/08/001",
    schoolId: "sch-101",
    studentId: "stu-001",
    studentName: "Ahmad Rizky",
    classGroupId: "cls-5a",
    className: "Kelas 5 — Cendekia",
    waliTeacherId: "u-3",
    waliTeacherName: "Siti Nurhaliza, S.Pd",
    templateId: "cert-template-1",
    title: "Sertifikat Pencapaian Ahmad Rizky",
    description:
      "Diberikan atas pencapaian kebiasaan Bangun Pagi pada periode Juli 2026.",
    periodLabel: "Juli 2026",
    issuerName: "SD anaktumbuh",
    issuerRoleLabel: "Kepala Sekolah",
    issuedAt: "2026-08-01T08:00:00.000Z",
    status: "issued",
  },
];

function assertManage(user: UserProfile) {
  if (
    user.permissions.includes("*") ||
    user.permissions.includes("manage:certificates")
  )
    return;
  throw new Error("Anda tidak memiliki izin untuk mengelola sertifikat.");
}
function assertSchoolScope(user: UserProfile, schoolId: string) {
  if (user.role === "super_admin") return;
  if (
    (user.role === "kepala_sekolah" || user.role === "wali_kelas") &&
    user.schoolId === schoolId
  )
    return;
  throw new Error("Akses sertifikat di luar scope sekolah ditolak.");
}
const makeCertificateNumber = (index: number) =>
  `CERT/AT-ID/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${String(index).padStart(3, "0")}`;

export const certificateService = {
  async getContext(
    user: UserProfile,
    schoolId?: string,
  ): Promise<CertificateManagementContext> {
    await wait();
    assertManage(user);
    const targetSchoolId =
      user.role === "super_admin" ? schoolId : user.schoolId;
    if (!targetSchoolId) throw new Error("Sekolah belum dipilih.");
    assertSchoolScope(user, targetSchoolId);
    const [students, schools, teachers] = await Promise.all([
      studentService.listStudents(user, targetSchoolId),
      schoolMasterService.listSchools(user),
      teacherService.list(user, targetSchoolId),
    ]);
    const schoolName =
      schools.find((school) => school.id === targetSchoolId)?.name ??
      "anaktumbuh";
    const groups = await schoolMasterService.listClassGroups(
      user,
      targetSchoolId,
    );
    return {
      templates: structuredClone(
        templates.filter((template) => template.active),
      ),
      issued: structuredClone(
        issued.filter((item) => item.schoolId === targetSchoolId),
      ),
      studentOptions: students
        .filter((student) => student.status === "active")
        .map((student) => ({
          id: student.id,
          name: student.name,
          className: groups.find((g) => g.id === student.classGroupId)
            ? `${groups.find((g) => g.id === student.classGroupId)!.levelName} — ${groups.find((g) => g.id === student.classGroupId)!.rombelName}`
            : "—",
          classGroupId: student.classGroupId,
        })),
      waliTeachers: teachers
        .filter(
          (teacher) => teacher.status === "active" && !!teacher.classGroupId,
        )
        .map((teacher) => ({
          id: teacher.id,
          name: teacher.name,
          classGroupId: teacher.classGroupId,
          classGroupName: teacher.classGroupName,
        })),
    };
  },

  async saveSelectedTemplate(
    user: UserProfile,
    schoolId: string,
    templateId: string,
  ) {
    await wait();
    assertManage(user);
    assertSchoolScope(user, schoolId);
    const template = templates.find(
      (item) => item.id === templateId && item.active,
    );
    if (!template)
      throw new Error("Template sertifikat tidak ditemukan atau tidak aktif.");
    templates = templates.map((item) => ({
      ...item,
      active: item.id === template.id,
    }));
    return structuredClone(template);
  },

  async createTemplate(
    user: UserProfile,
    schoolId: string,
    input: Omit<CertificateTemplate, "id" | "version" | "updatedAt">,
  ) {
    await wait();
    assertManage(user);
    assertSchoolScope(user, schoolId);
    if (!input.name.trim()) throw new Error("Nama template wajib diisi.");
    if (!input.titleTemplate.trim())
      throw new Error("Format judul sertifikat wajib diisi.");
    const template: CertificateTemplate = {
      ...input,
      id: `cert-template-${Date.now()}`,
      version: 1,
      updatedAt: now(),
    };
    templates = [template, ...templates];
    return structuredClone(template);
  },

  async issue(
    user: UserProfile,
    request: CertificateIssueRequest,
  ): Promise<IssuedCertificate[]> {
    await wait();
    assertManage(user);
    assertSchoolScope(user, request.schoolId);
    if (!request.studentIds.length)
      throw new Error("Pilih minimal satu siswa.");
    if (!request.periodLabel.trim()) throw new Error("Periode wajib diisi.");
    const template = templates.find(
      (item) => item.id === request.templateId && item.active,
    );
    if (!template)
      throw new Error("Template sertifikat tidak ditemukan atau tidak aktif.");
    const students = await studentService.listStudents(user, request.schoolId);
    const teachers = await teacherService.list(user, request.schoolId);
    const wali = teachers.find(
      (teacher) =>
        teacher.id === request.waliTeacherId &&
        teacher.status === "active" &&
        !!teacher.classGroupId,
    );
    if (!wali) throw new Error("Wali Kelas aktif tidak ditemukan.");
    const groups = await schoolMasterService.listClassGroups(
      user,
      request.schoolId,
    );
    const selected = students.filter(
      (student) =>
        request.studentIds.includes(student.id) &&
        student.status === "active" &&
        student.classGroupId === wali.classGroupId,
    );
    if (!selected.length)
      throw new Error(
        "Penerima harus berasal dari rombel Wali Kelas yang dipilih.",
      );
    const result = selected.map((student, offset) => {
      const classGroup = groups.find(
        (group) => group.id === student.classGroupId,
      );
      const habitName =
        request.habitName ||
        request.awardTitle ||
        "7 Kebiasaan Anak Indonesia Hebat";
      const title = template.titleTemplate
        .replaceAll("{student}", student.name)
        .replaceAll("{habit}", habitName)
        .replaceAll("{period}", request.periodLabel);
      const description = (request.descriptionOverride?.trim() || template.descriptionTemplate)
        .replaceAll("{student}", student.name)
        .replaceAll("{habit}", habitName)
        .replaceAll("{period}", request.periodLabel);
      return {
        id: `issued-cert-${Date.now()}-${student.id}`,
        certificateNumber: makeCertificateNumber(issued.length + offset + 1),
        schoolId: request.schoolId,
        studentId: student.id,
        studentName: student.name,
        classGroupId: student.classGroupId,
        className: classGroup
          ? `${classGroup.levelName} — ${classGroup.rombelName}`
          : "—",
        waliTeacherId: wali.id,
        waliTeacherName: wali.name,
        templateId: template.id,
        title,
        description,
        periodLabel: request.periodLabel,
        issuerName:
          request.schoolId === "sch-101" ? "SD anaktumbuh" : "anaktumbuh",
        issuerRoleLabel: "Kepala Sekolah",
        issuedAt: now(),
        status: "issued" as const,
      };
    });
    issued = [...result, ...issued];
    return structuredClone(result);
  },

  async getWaliContext(user: UserProfile): Promise<WaliCertificateContext> {
    await wait();
    if (user.role !== "wali_kelas" || !user.schoolId || !user.classId)
      throw new Error("Wali Kelas belum memiliki scope rombel yang valid.");
    if (
      !user.permissions.includes("read:certificates") &&
      !user.permissions.includes("*")
    )
      throw new Error("Anda tidak memiliki izin melihat sertifikat.");
    return {
      issued: structuredClone(
        issued.filter(
          (item) =>
            item.schoolId === user.schoolId &&
            item.waliTeacherId === user.id &&
            item.classGroupId === user.classId &&
            item.status === "issued",
        ),
      ),
    };
  },

  async revoke(user: UserProfile, schoolId: string, certificateId: string) {
    await wait();
    assertManage(user);
    assertSchoolScope(user, schoolId);
    const item = issued.find((certificate) => certificate.id === certificateId);
    if (!item) throw new Error("Sertifikat tidak ditemukan.");
    item.status = "revoked";
    return structuredClone(item);
  },
};
