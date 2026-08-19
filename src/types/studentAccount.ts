import { Student } from "./student";

export type AccountGenerationScope = "ALL_DIGITAL" | "ACADEMIC_YEAR" | "CLASS_GROUP" | "SELECTED";

export interface AccountGenerationRequest {
  schoolId: string;
  academicYearId?: string;
  classGroupId?: string;
  studentIds?: string[];
  scope: AccountGenerationScope;
}

export interface GeneratedQrCredential {
  studentId: string;
  studentName: string;
  schoolId: string;
  academicYearId: string;
  classGroupId: string;
  levelName: string;
  rombelName: string;
  qrToken: string;
  generatedAt: string;
}

export interface QrDownloadFilter {
  academicYearId?: string;
  levelName?: string;
  classGroupId?: string;
}

export interface BulkGenerationResult {
  generated: Student[];
  skippedManual: number;
  skippedAlreadyGenerated: number;
  credentials: GeneratedQrCredential[];
}
