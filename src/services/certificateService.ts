import { UserProfile } from "../types/auth";
import { CertificateIssueRequest, CertificateManagementContext, CertificateTemplate, IssuedCertificate } from "../types/certificate";
import { studentService } from "./studentService";
import { schoolMasterService } from "./schoolMasterService";

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => new Date().toISOString();

let templates: CertificateTemplate[] = [
  {
    id: "cert-template-1",
    name: "Sertifikat Kebiasaan Hebat",
    titleTemplate: "Sertifikat Pencapaian {student}",
    descriptionTemplate: "Diberikan kepada {student} atas pencapaian kebiasaan {habit} pada periode {period}.",
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
    issuerRoleLabel: "Sekolah",
    active: true,
    version: 1,
    updatedAt: now(),
  },
];

let issued: IssuedCertificate[] = [
  {
    id: "issued-cert-1",
    certificateNumber: "CERT/AT-ID/2026/08/001",
    studentId: "stu-001",
    studentName: "Ahmad Rizky",
    templateId: "cert-template-1",
    title: "Sertifikat Pencapaian Ahmad Rizky",
    description: "Diberikan atas pencapaian kebiasaan Bangun Pagi pada periode Juli 2026.",
    periodLabel: "Juli 2026",
    issuerName: "SD ANAKTUMBUH",
    issuerRoleLabel: "Kepala Sekolah",
    issuedAt: "2026-08-01T08:00:00.000Z",
    status: "issued",
  },
];

function assertAccess(user: UserProfile) {
  if (user.permissions.includes("*") || user.permissions.includes("manage:certificates")) return;
  throw new Error("Anda tidak memiliki izin untuk mengelola sertifikat.");
}

function assertSchoolScope(user: UserProfile, schoolId: string) {
  if (user.role === "super_admin") return;
  if (user.role === "kepala_sekolah" && user.schoolId === schoolId) return;
  throw new Error("Akses sertifikat di luar scope sekolah ditolak.");
}

const makeCertificateNumber = (index: number) => `CERT/AT-ID/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${String(index).padStart(3, "0")}`;

export const certificateService = {
  async getContext(user: UserProfile, schoolId?: string): Promise<CertificateManagementContext> {
    await wait();
    assertAccess(user);
    const targetSchoolId = user.role === "super_admin" ? schoolId : user.schoolId;
    if (!targetSchoolId) throw new Error("Sekolah belum dipilih.");
    assertSchoolScope(user, targetSchoolId);

    const [students, schools] = await Promise.all([
      studentService.listStudents(user, targetSchoolId),
      schoolMasterService.listSchools(user),
    ]);
    const schoolName = schools.find((school) => school.id === targetSchoolId)?.name ?? "ANAKTUMBUH";

    return {
      templates: structuredClone(templates),
      issued: structuredClone(issued.filter((item) => students.some((student) => student.id === item.studentId))),
      studentOptions: students
        .filter((student) => student.status === "active")
        .map((student) => ({
          id: student.id,
          name: student.name,
          className: student.classGroupId,
        })),
    };
  },

  async createTemplate(user: UserProfile, schoolId: string, input: Omit<CertificateTemplate, "id" | "version" | "updatedAt">) {
    await wait();
    assertAccess(user);
    assertSchoolScope(user, schoolId);
    if (!input.name.trim()) throw new Error("Nama template wajib diisi.");
    if (!input.titleTemplate.trim()) throw new Error("Format judul sertifikat wajib diisi.");
    const template: CertificateTemplate = {
      ...input,
      id: `cert-template-${Date.now()}`,
      version: 1,
      updatedAt: now(),
    };
    templates = [template, ...templates];
    return structuredClone(template);
  },

  async issue(user: UserProfile, request: CertificateIssueRequest): Promise<IssuedCertificate[]> {
    await wait();
    assertAccess(user);
    assertSchoolScope(user, request.schoolId);
    if (!request.studentIds.length) throw new Error("Pilih minimal satu siswa.");
    if (!request.periodLabel.trim()) throw new Error("Periode wajib diisi.");

    const template = templates.find((item) => item.id === request.templateId && item.active);
    if (!template) throw new Error("Template sertifikat tidak ditemukan atau tidak aktif.");

    const students = await studentService.listStudents(user, request.schoolId);
    const selected = students.filter((student) => request.studentIds.includes(student.id) && student.status === "active");
    if (!selected.length) throw new Error("Tidak ada siswa aktif yang valid dalam scope.");

    const result: IssuedCertificate[] = selected.map((student, offset) => {
      const habitName = request.habitName || "7 Kebiasaan Anak Indonesia Hebat";
      const title = template.titleTemplate.replaceAll("{student}", student.name).replaceAll("{habit}", habitName).replaceAll("{period}", request.periodLabel);
      const description = template.descriptionTemplate.replaceAll("{student}", student.name).replaceAll("{habit}", habitName).replaceAll("{period}", request.periodLabel);
      return {
        id: `issued-cert-${Date.now()}-${student.id}`,
        certificateNumber: makeCertificateNumber(issued.length + offset + 1),
        studentId: student.id,
        studentName: student.name,
        templateId: template.id,
        title,
        description,
        periodLabel: request.periodLabel,
        issuerName: request.schoolId === "sch-101" ? "SD ANAKTUMBUH" : "ANAKTUMBUH",
        issuerRoleLabel: user.role === "super_admin" ? "Super Admin" : template.issuerRoleLabel,
        issuedAt: now(),
        status: "issued",
      };
    });

    issued = [...result, ...issued];
    return structuredClone(result);
  },

  async revoke(user: UserProfile, schoolId: string, certificateId: string) {
    await wait();
    assertAccess(user);
    assertSchoolScope(user, schoolId);
    const item = issued.find((certificate) => certificate.id === certificateId);
    if (!item) throw new Error("Sertifikat tidak ditemukan.");
    item.status = "revoked";
    return structuredClone(item);
  },
};
