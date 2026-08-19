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
}

export interface CertificateIssueRequest {
  schoolId: string;
  templateId: string;
  studentIds: string[];
  basis: CertificateBasis;
  habitName?: string;
  periodLabel: string;
  awardTitle?: string;
}

export interface IssuedCertificate {
  id: string;
  certificateNumber: string;
  studentId: string;
  studentName: string;
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
  studentOptions: { id: string; name: string; className: string }[];
}

export const CERTIFICATE_MANAGEMENT_ROLES: UserRole[] = ["super_admin", "kepala_sekolah"];
