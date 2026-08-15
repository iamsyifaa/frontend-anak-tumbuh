import { AuthResponse, LoginCredentials, UserProfile } from "../types/auth";

// Mock DB User untuk pengujian
const MOCK_USERS: Record<string, UserProfile> = {
  admin: {
    id: "u-1",
    name: "Super Admin System",
    username: "admin",
    role: "super_admin",
    permissions: ["*"],
  },
  kepsek: {
    id: "u-2",
    name: "Dr. H. Ahmad Sanusi, M.Pd",
    username: "kepsek",
    role: "kepala_sekolah",
    schoolId: "sch-101",
    permissions: [
      "read:school_analytics",
      "read:class_reports",
      "read:school_master",
      "write:school_master",
    ],
  },
  walikelas: {
    id: "u-3",
    name: "Siti Nurhaliza, S.Pd",
    username: "walikelas",
    role: "wali_kelas",
    schoolId: "sch-101",
    classId: "cls-5a",
    permissions: ["read:student_habits", "write:teacher_notes"],
  },
  siswa: {
    id: "u-4",
    name: "Ahmad Rizky",
    username: "siswa_rizky",
    role: "siswa",
    schoolId: "sch-101",
    classId: "cls-5a",
    permissions: ["read:own_habits", "write:own_habits"],
  },
};

export const authService = {
  // Login dengan Username/Password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulasi latency jaringan

    const user = MOCK_USERS[credentials.username.toLowerCase()];
    if (!user) {
      throw new Error("Username atau password tidak ditemukan.");
    }

    return {
      token: `mock-jwt-token-${user.id}-${Date.now()}`,
      user,
    };
  },

  // Login via QR Token Unik Siswa (Satu Scan)
  async loginWithQrToken(qrToken: string): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const VALID_MOCK_QR = "mock-valid-qr-token-siswa";

    if (qrToken !== VALID_MOCK_QR) {
      throw new Error("Kode QR tidak valid atau sudah tidak aktif.");
    }

    const studentUser = MOCK_USERS["siswa"];

    return {
      token: `mock-qr-token-${studentUser.id}-${Date.now()}`,
      user: studentUser,
    };
  },

  // Verifikasi Session/Me
  async getCurrentUser(token: string): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (!token) throw new Error("Unauthenticated");

    if (token.includes("u-1")) return MOCK_USERS["admin"];
    if (token.includes("u-2")) return MOCK_USERS["kepsek"];
    if (token.includes("u-3")) return MOCK_USERS["walikelas"];
    return MOCK_USERS["siswa"];
  },
};
