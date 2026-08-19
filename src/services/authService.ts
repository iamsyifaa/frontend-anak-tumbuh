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
      "read:teachers",
      "write:teachers",
      "read:class_reports",
      "read:school_master",
      "write:school_master",
      "read:students",
      "write:students",
      "import:students",
      "generate:student_qr",
      "read:habit_config",
      "manage:habit_config",
      "read:point_config",
      "manage:point_config",
      "read:student_gamification",
      "read:reports",
      "export:reports",
    ],
  },
  walikelas: {
    id: "u-3",
    name: "Siti Nurhaliza, S.Pd",
    username: "walikelas",
    role: "wali_kelas",
    schoolId: "sch-101",
    classId: "cls-5a",
    permissions: ["read:student_habits", "write:teacher_notes", "read:reports", "export:reports"],
  },
  siswa_manual: {
    id: "u-5",
    name: "Bima Pratama",
    username: "siswa_manual",
    role: "siswa",
    schoolId: "sch-101",
    classId: "cls-5a",
    permissions: ["read:own_habits", "read:reports", "export:reports"],
    method: "MANUAL",
  },
  siswa_citra: {
    id: "u-6",
    name: "Citra Lestari",
    username: "siswa_citra",
    role: "siswa",
    schoolId: "sch-101",
    classId: "cls-8b",
    permissions: ["read:own_habits", "write:own_habits", "read:reports", "export:reports"],
    method: "DIGITAL",
    gender: "P",
    avatarUrl: "/image/perempuan.png",
  },
  siswa: {
    id: "u-4",
    name: "Ahmad Rizky",
    username: "siswa_rizky",
    role: "siswa",
    schoolId: "sch-101",
    classId: "cls-5a",
    permissions: ["read:own_habits", "write:own_habits", "read:reports", "export:reports"],
    method: "DIGITAL",
    gender: "L",
    avatarUrl: "/image/laki_laki.png",
  },
};

// Development-only credentials. Production authentication must be delegated to Laravel.
const MOCK_PASSWORDS: Record<string, string> = {
  admin: "admin123",
  kepsek: "kepsek123",
  walikelas: "walikelas123",
};

export const authService = {
  // Login dengan Username/Password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulasi latency jaringan

    const username = credentials.username.trim().toLowerCase();
    const user = MOCK_USERS[username];
    const expectedPassword = MOCK_PASSWORDS[username];

    // Username/password login is intentionally limited to administrative roles.
    if (!user || !expectedPassword || user.role === "siswa") {
      throw new Error("Akun administrasi tidak ditemukan.");
    }

    if (!credentials.password || credentials.password !== expectedPassword) {
      throw new Error("Username atau password salah.");
    }

    return {
      token: `mock-jwt-token-${user.id}-${Date.now()}`,
      user,
    };
  },

  // Login via QR Token Unik Siswa (Satu Scan)
  async loginWithQrToken(rawQrValue: string): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Mock contract accepts either the raw credential or the URL printed in the QR.
    // Production must send the credential to the backend for validation/revocation checks.
    let qrToken = rawQrValue.trim();
    try {
      const parsed = new URL(qrToken);
      const tokenFromUrl = parsed.searchParams.get("token");
      if (tokenFromUrl) qrToken = tokenFromUrl;
    } catch {
      // The scanned value can be a raw credential rather than a URL.
    }

    const credentialMatch = qrToken.match(/^mock-student-qr-(stu-[a-z0-9-]+)-[a-f0-9]+$/i);
    const studentId = credentialMatch?.[1]?.toLowerCase();

    if (qrToken !== "mock-valid-qr-token-siswa" && !credentialMatch) {
      throw new Error("Kode QR tidak valid atau sudah tidak aktif.");
    }

    const studentUser = studentId === "stu-003" ? MOCK_USERS["siswa_citra"] : MOCK_USERS["siswa"];

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
    if (token.includes("u-5")) return MOCK_USERS["siswa_manual"];
    if (token.includes("u-6")) return MOCK_USERS["siswa_citra"];
    return MOCK_USERS["siswa"];
  },
};
