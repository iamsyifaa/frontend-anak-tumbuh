export type TeacherStatus = "active" | "inactive";

export interface Teacher {
  id: string;
  schoolId: string;
  name: string;
  username: string;
  status: TeacherStatus;
  classGroupId?: string;
  classGroupName?: string;
}

export interface CreateTeacherInput {
  schoolId: string;
  name: string;
  username: string;
  password?: string;
  status: TeacherStatus;
}

export interface UpdateTeacherInput extends CreateTeacherInput {
  classGroupId?: string;
}

export interface ImportTeacherRow {
  rowNumber: number;
  name: string;
  username: string;
  status: TeacherStatus | "";
  levelName?: string;
  rombelName?: string;
}

export interface ValidatedTeacherImportRow extends ImportTeacherRow {
  valid: boolean;
  classGroupId?: string;
  errors: string[];
}
