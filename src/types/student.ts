export type StudentMethod = "DIGITAL" | "MANUAL";
export type StudentStatus = "pending" | "active" | "inactive" | "transferred" | "graduated";
export type StudentAccountStatus = "not_generated" | "generated";
export type StudentQrStatus = "not_available" | "active" | "revoked";

export interface Student {
  id: string;
  schoolId: string;
  academicYearId: string;
  classGroupId: string;
  name: string;
  nisn?: string;
  nis?: string;
  method: StudentMethod;
  status: StudentStatus;
  accountStatus: StudentAccountStatus;
  qrStatus: StudentQrStatus;
  createdAt: string;
}

export interface CreateStudentInput {
  schoolId: string;
  academicYearId: string;
  classGroupId: string;
  name: string;
  nisn?: string;
  nis?: string;
  method: StudentMethod;
  status: StudentStatus;
}

export interface ImportStudentRow {
  rowNumber: number;
  name: string;
  nisn?: string;
  nis?: string;
  levelName?: string;
  rombelName?: string;
  method: StudentMethod | "";
}

export interface ImportStudentError {
  rowNumber: number;
  field?: string;
  code: "required" | "duplicate" | "invalid" | "scope" | "format";
  message: string;
}

export interface ValidatedImportRow extends ImportStudentRow {
  valid: boolean;
  classGroupId?: string;
  academicYearId?: string;
  errors: ImportStudentError[];
}

export interface StudentImportSummary {
  total: number;
  valid: number;
  invalid: number;
}
