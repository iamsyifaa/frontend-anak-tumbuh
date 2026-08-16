export type SchoolStatus = "active" | "inactive";
export type AcademicYearStatus = "active" | "inactive";

export interface School {
  id: string;
  name: string;
  timezone: string;
  status: SchoolStatus;
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
}

export interface ClassGroup {
  id: string;
  schoolId: string;
  academicYearId: string;
  levelName: string;
  rombelName: string;
  homeroomTeacherId?: string;
  homeroomTeacherName?: string;
}

export interface MasterTeacherOption {
  id: string;
  schoolId: string;
  name: string;
}

export interface CreateSchoolInput {
  name: string;
  timezone: string;
}

export interface UpdateSchoolInput extends CreateSchoolInput {
  status: SchoolStatus;
}

export interface UpdateAcademicYearInput extends Omit<CreateAcademicYearInput, "schoolId"> {}

export interface UpdateClassGroupInput extends Omit<CreateClassGroupInput, "schoolId"> {}

export interface CreateAcademicYearInput {
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
}

export interface CreateClassGroupInput {
  schoolId: string;
  academicYearId: string;
  levelName: string;
  rombelName: string;
  homeroomTeacherId?: string;
}
