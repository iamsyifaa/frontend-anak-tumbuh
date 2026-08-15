import { UserProfile } from "../types/auth";
import { GamificationSummary, PointConfiguration, LevelThreshold } from "../types/pointConfiguration";

export const POINT_CONFIG_PERMISSIONS = {
  read: "read:point_config",
  write: "manage:point_config",
} as const;

const now = () => new Date().toISOString();

let configuration: PointConfiguration = {
  id: "point-config-sch-101",
  scope: "school",
  schoolId: "sch-101",
  version: 1,
  status: "published",
  initiativeBonusPoints: 2,
  levelThresholds: [
    { level: 1, requiredExp: 0 },
    { level: 2, requiredExp: 50 },
    { level: 3, requiredExp: 120 },
    { level: 4, requiredExp: 220 },
    { level: 5, requiredExp: 350 },
  ],
  updatedAt: now(),
};

const assertAccess = (user: UserProfile, permission: string) => {
  if (user.role === "super_admin") return;
  if (!user.permissions.includes(permission)) throw new Error("Anda tidak memiliki izin untuk mengelola konfigurasi Poin/EXP.");
};

const assertSchoolScope = (user: UserProfile, schoolId: string) => {
  if (user.role === "super_admin") return;
  if (!user.schoolId || user.schoolId !== schoolId) throw new Error("Akses ditolak: konfigurasi di luar sekolah Anda.");
};

const clone = <T,>(value: T): T => structuredClone(value);

export const pointConfigurationService = {
  async getConfiguration(user: UserProfile, schoolId = user.schoolId): Promise<PointConfiguration> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    assertAccess(user, POINT_CONFIG_PERMISSIONS.read);
    if (!schoolId) throw new Error("Sekolah tidak ditemukan.");
    assertSchoolScope(user, schoolId);
    return clone(configuration);
  },

  async updateInitiativeBonus(user: UserProfile, schoolId: string, bonusPoints: number): Promise<PointConfiguration> {
    await new Promise((resolve) => setTimeout(resolve, 280));
    assertAccess(user, POINT_CONFIG_PERMISSIONS.write);
    assertSchoolScope(user, schoolId);
    if (!Number.isInteger(bonusPoints) || bonusPoints < 0) throw new Error("Bonus inisiatif harus berupa bilangan bulat 0 atau lebih.");
    configuration.initiativeBonusPoints = bonusPoints;
    configuration.status = "draft";
    configuration.updatedAt = now();
    return clone(configuration);
  },

  async saveLevelThresholds(user: UserProfile, schoolId: string, thresholds: LevelThreshold[]): Promise<PointConfiguration> {
    await new Promise((resolve) => setTimeout(resolve, 320));
    assertAccess(user, POINT_CONFIG_PERMISSIONS.write);
    assertSchoolScope(user, schoolId);
    if (!thresholds.length) throw new Error("Minimal satu threshold level diperlukan.");
    const sorted = [...thresholds].sort((a, b) => a.level - b.level);
    if (sorted[0].level !== 1 || sorted[0].requiredExp !== 0) throw new Error("Level 1 harus dimulai dari 0 EXP.");
    for (let index = 0; index < sorted.length; index += 1) {
      const current = sorted[index];
      if (!Number.isInteger(current.level) || current.level !== index + 1) throw new Error("Nomor level harus berurutan mulai dari 1.");
      if (!Number.isInteger(current.requiredExp) || current.requiredExp < 0) throw new Error("Threshold EXP tidak boleh negatif.");
      if (index > 0 && current.requiredExp <= sorted[index - 1].requiredExp) throw new Error("Threshold EXP harus meningkat bertahap.");
    }
    configuration.levelThresholds = sorted;
    configuration.status = "draft";
    configuration.updatedAt = now();
    return clone(configuration);
  },

  async publish(user: UserProfile, schoolId: string): Promise<PointConfiguration> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    assertAccess(user, POINT_CONFIG_PERMISSIONS.write);
    assertSchoolScope(user, schoolId);
    if (configuration.levelThresholds[0]?.requiredExp !== 0) throw new Error("Konfigurasi level tidak valid.");
    configuration.version += 1;
    configuration.status = "published";
    configuration.updatedAt = now();
    return clone(configuration);
  },

  // Mock contract: backend mengembalikan nilai final; frontend tidak menghitung Poin/EXP/Level/Ranking.
  async getStudentSummary(user: UserProfile, studentId = user.id): Promise<GamificationSummary> {
    await new Promise((resolve) => setTimeout(resolve, 260));
    if (user.role !== "siswa" && !user.permissions.includes("read:student_gamification") && user.role !== "super_admin") {
      throw new Error("Anda tidak memiliki izin melihat Poin/EXP/Level siswa.");
    }
    return {
      studentId,
      points: 1450,
      exp: 820,
      level: 6,
      rank: 3,
      nextLevelExp: 1000,
      expIntoCurrentLevel: 120,
      expToNextLevel: 180,
      source: "backend",
      updatedAt: now(),
    };
  },

  // Mock contract untuk submission: backend mengembalikan hasil transaksi dan summary terbaru.
  async submitHabitAndGetSummary(user: UserProfile, studentId: string, habitId: string, initiative: string): Promise<{ pointsAwarded: number; expAwarded: number; summary: GamificationSummary }> {
    await new Promise((resolve) => setTimeout(resolve, 420));
    if (user.role !== "siswa") throw new Error("Hanya siswa Digital yang dapat mengirim pengisian aplikasi.");
    if (!studentId || !habitId || !initiative) throw new Error("Data submission tidak lengkap.");
    return {
      pointsAwarded: 10,
      expAwarded: 12,
      summary: {
        studentId,
        points: 1460,
        exp: 832,
        level: 6,
        rank: 3,
        nextLevelExp: 1000,
        expIntoCurrentLevel: 132,
        expToNextLevel: 168,
        source: "backend",
        updatedAt: now(),
      },
    };
  },
};
