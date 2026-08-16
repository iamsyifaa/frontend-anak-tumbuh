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
