import { UserRole } from "./auth";

export type CertificateBasis = "award" | "habit" | "period";

export interface CertificateTemplate {
  id: string;
  name: string;
  titleTemplate: string;
  descriptionTemplate: string;
  issuerRoleLabel: string;
  active: boolean;
  version: number;
  updatedAt: string;
  templateCode?: "classic-blue-gold";
}

export interface CertificateIssueRequest {
  schoolId: string;
  templateId: string;
  studentIds: string[];
  basis: CertificateBasis;
  habitName?: string;
  periodLabel: string;
  awardTitle?: string;
  descriptionOverride?: string;
  waliTeacherId: string;
}

export interface IssuedCertificate {
  id: string;
  certificateNumber: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classGroupId: string;
  className: string;
  waliTeacherId: string;
  waliTeacherName: string;
  templateId: string;
  title: string;
  description: string;
  periodLabel: string;
  issuerName: string;
  issuerRoleLabel: string;
  issuedAt: string;
  status: "issued" | "revoked";
}

export interface CertificateManagementContext {
  templates: CertificateTemplate[];
  issued: IssuedCertificate[];
  studentOptions: { id: string; name: string; className: string; classGroupId: string }[];
  waliTeachers: { id: string; name: string; classGroupId?: string; classGroupName?: string }[];
}

export interface WaliCertificateContext {
  issued: IssuedCertificate[];
}

export const CERTIFICATE_MANAGEMENT_ROLES: UserRole[] = ["super_admin", "kepala_sekolah"];
