export type TeacherStatus = "active" | "inactive";

export interface Teacher {
  id: string;
  schoolId: string;
  name: string;
  username: string;
  password: string;
  status: TeacherStatus;
  classGroupId?: string;
  classGroupName?: string;
}

export interface CreateTeacherInput {
  schoolId: string;
  name: string;
  status: TeacherStatus;
  classGroupId?: string;
}

export interface UpdateTeacherInput {
  schoolId: string;
  name: string;
  username: string;
  status: TeacherStatus;
  classGroupId?: string;
}

export interface TeacherCreateResult {
  teacher: Teacher;
  credential: TeacherGeneratedCredential;
}

export interface ImportTeacherRow {
  rowNumber: number;
  name: string;
  username?: string;
  status: TeacherStatus | "";
  levelName?: string;
  rombelName?: string;
}

export interface ValidatedTeacherImportRow extends ImportTeacherRow {
  valid: boolean;
  classGroupId?: string;
  errors: string[];
  generatedUsername?: string;
  generatedPassword?: string;
}

export interface TeacherGeneratedCredential {
  teacherId: string;
  teacherName: string;
  username: string;
  temporaryPassword: string;
  classGroupName?: string;
}
