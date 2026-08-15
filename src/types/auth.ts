export type UserRole =
  | "super_admin"
  | "kepala_sekolah"
  | "wali_kelas"
  | "siswa";

export interface UserPermission {
  action: string; // contoh: 'read:reports', 'write:habits'
  resource: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  schoolId?: string;
  classId?: string;
  avatarUrl?: string;
  permissions: string[]; // Permission list dikirim langsung dari backend
  method?: "DIGITAL" | "MANUAL"; // Metode pengisian siswa dari backend
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface LoginCredentials {
  username: string;
  password?: string;
}
