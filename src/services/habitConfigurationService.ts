import { UserProfile } from "../types/auth";
import {
  Habit,
  HabitConfiguration,
  HabitIndicator,
  IndicatorOption,
  SaveConditionInput,
  SaveHabitInput,
  SaveIndicatorInput,
  SaveOptionInput,
} from "../types/habitConfiguration";

export const HABIT_CONFIG_PERMISSIONS = {
  read: "read:habit_config",
  write: "manage:habit_config",
} as const;

const now = () => new Date().toISOString();

const option = (id: string, label: string, points: number, exp: number, order: number): IndicatorOption => ({
  id, label, points, exp, order, active: true,
});

const initiative = (habitId: string, order: number): HabitIndicator => ({
  id: `${habitId}-initiative`,
  habitId,
  name: "Inisiatif",
  description: "Siapa yang memulai kegiatan tersebut?",
  order,
  required: true,
  active: true,
  options: [
    option(`${habitId}-initiative-self`, "Sadar sendiri", 5, 5, 1),
    option(`${habitId}-initiative-prompted`, "Disuruh", 0, 0, 2),
  ],
  conditions: [],
});

const buildMockConfiguration = (): HabitConfiguration => {
  const habits: Habit[] = [
    {
      id: "habit-1",
      name: "Bangun Pagi",
      description: "Kebiasaan bangun sesuai waktu yang ditetapkan.",
      order: 1,
      active: true,
      indicators: [
        { id: "h1-time", habitId: "habit-1", name: "Jam Bangun", description: "Waktu bangun siswa.", order: 1, required: true, active: true, options: [option("h1-before-4", "Sebelum 04.00", 10, 10, 1), option("h1-4-430", "04.00–04.30", 9, 9, 2), option("h1-430-5", "04.30–05.00", 8, 8, 3), option("h1-5-530", "05.00–05.30", 7, 7, 4), option("h1-530-6", "05.30–06.00", 5, 5, 5), option("h1-after-6", "Di atas 06.00", 2, 2, 6)], conditions: [] },
        initiative("habit-1", 2),
      ],
    },
    {
      id: "habit-2",
      name: "Beribadah",
      description: "Kebiasaan menjalankan ibadah sesuai konteks sekolah/siswa.",
      order: 2,
      active: true,
      indicators: [
        { id: "h2-choice", habitId: "habit-2", name: "Pilihan", description: "Pilihan pelaksanaan ibadah.", order: 1, required: true, active: true, options: [option("h2-full", "Wajib dan sunah", 10, 10, 1), option("h2-required", "Hanya wajib", 7, 7, 2), option("h2-incomplete", "Tidak lengkap", 3, 3, 3)], conditions: [] },
        initiative("habit-2", 2),
      ],
    },
    {
      id: "habit-3",
      name: "Berolahraga",
      description: "Kebiasaan melakukan aktivitas olahraga.",
      order: 3,
      active: true,
      indicators: [
        { id: "h3-yesno", habitId: "habit-3", name: "Apakah olahraga?", description: "Tentukan apakah siswa berolahraga hari ini.", order: 1, required: true, active: true, options: [option("h3-yes", "Ya", 5, 5, 1), option("h3-no", "Tidak", 0, 0, 2)], conditions: [] },
        { id: "h3-duration", habitId: "habit-3", name: "Durasi jika Ya", description: "Ditampilkan hanya ketika olahraga = Ya.", order: 2, required: true, active: true, options: [option("h3-under30", "Di bawah 30 menit", 5, 5, 1), option("h3-30-60", "30 menit–1 jam", 8, 8, 2), option("h3-over60", "Di atas 1 jam", 10, 10, 3)], conditions: [{ id: "cond-h3-duration", sourceIndicatorId: "h3-yesno", operator: "equals", sourceOptionId: "h3-yes" }] },
        initiative("habit-3", 3),
      ],
    },
    {
      id: "habit-4",
      name: "Makan Sehat dan Bergizi",
      description: "Kebiasaan menjaga pola makan.",
      order: 4,
      active: true,
      indicators: [
        { id: "h4-choice", habitId: "habit-4", name: "Pilihan", description: "Kondisi sarapan.", order: 1, required: true, active: true, options: [option("h4-none", "Tidak sarapan", 2, 2, 1), option("h4-low", "Sarapan kurang", 6, 6, 2), option("h4-enough", "Sarapan cukup", 10, 10, 3)], conditions: [] },
        initiative("habit-4", 2),
      ],
    },
    {
      id: "habit-5",
      name: "Gemar Belajar",
      description: "Kebiasaan menyediakan waktu untuk belajar.",
      order: 5,
      active: true,
      indicators: [
        { id: "h5-duration", habitId: "habit-5", name: "Durasi", description: "Durasi belajar.", order: 1, required: true, active: true, options: [option("h5-none", "Tidak belajar", 0, 0, 1), option("h5-under30", "Kurang dari 30 menit", 5, 5, 2), option("h5-30-60", "30 menit–1 jam", 8, 8, 3), option("h5-over60", "Di atas 1 jam", 10, 10, 4)], conditions: [] },
        initiative("habit-5", 2),
      ],
    },
    {
      id: "habit-6",
      name: "Bermasyarakat",
      description: "Kebiasaan melakukan kegiatan membantu lingkungan/keluarga.",
      order: 6,
      active: true,
      indicators: [
        { id: "h6-activity", habitId: "habit-6", name: "Jenis kegiatan", description: "Pilih kegiatan yang dilakukan.", order: 1, required: true, active: true, options: [option("h6-room", "Beres kamar tidur", 7, 7, 1), option("h6-yard", "Beres halaman", 7, 7, 2), option("h6-parent", "Membantu orang tua", 10, 10, 3), option("h6-notall", "Tidak semuanya", 3, 3, 4)], conditions: [] },
        initiative("habit-6", 2),
      ],
    },
    {
      id: "habit-7",
      name: "Tidur Cepat",
      description: "Kebiasaan menjaga waktu tidur.",
      order: 7,
      active: true,
      indicators: [
        { id: "h7-choice", habitId: "habit-7", name: "Pilihan", description: "Waktu tidur.", order: 1, required: true, active: true, options: [option("h7-under20", "Di bawah 20.00", 10, 10, 1), option("h7-20-2030", "20.00–20.30", 9, 9, 2), option("h7-2030-21", "20.30–21.00", 8, 8, 3), option("h7-21-22", "21.00–22.00", 5, 5, 4), option("h7-after22", "Di atas 22.00", 2, 2, 5)], conditions: [] },
        initiative("habit-7", 2),
      ],
    },
  ];

  return { id: "habit-config-sch-101", scope: "school", schoolId: "sch-101", version: 3, status: "published", updatedAt: now(), habits };
};

let configuration = buildMockConfiguration();

function assertAccess(user: UserProfile, permission: string) {
  const allowed = user.role === "super_admin" || user.permissions.includes(permission) || user.permissions.includes("*");
  if (!allowed) throw new Error("Anda tidak memiliki permission untuk konfigurasi 7 Kebiasaan.");
}

function assertSchoolScope(user: UserProfile, schoolId?: string) {
  if (user.role !== "super_admin" && schoolId && user.schoolId !== schoolId) {
    throw new Error("Akses konfigurasi sekolah di luar scope ditolak.");
  }
}

export const habitConfigurationService = {
  async getConfiguration(user: UserProfile, schoolId = user.schoolId): Promise<HabitConfiguration> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    assertAccess(user, HABIT_CONFIG_PERMISSIONS.read);
    assertSchoolScope(user, schoolId);
    return structuredClone(configuration);
  },

  async saveHabit(user: UserProfile, schoolId: string, habitId: string | null, input: SaveHabitInput): Promise<HabitConfiguration> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    assertAccess(user, HABIT_CONFIG_PERMISSIONS.write);
    assertSchoolScope(user, schoolId);
    if (!input.name.trim()) throw new Error("Nama kebiasaan wajib diisi.");
    if (habitId) {
      const habit = configuration.habits.find((item) => item.id === habitId);
      if (!habit) throw new Error("Kebiasaan tidak ditemukan.");
      habit.name = input.name.trim(); habit.description = input.description?.trim(); habit.active = input.active;
    } else {
      const id = `habit-${Date.now()}`;
      configuration.habits.push({ id, name: input.name.trim(), description: input.description?.trim(), order: configuration.habits.length + 1, active: input.active, indicators: [] });
    }
    configuration.updatedAt = now();
    return structuredClone(configuration);
  },

  async saveIndicator(user: UserProfile, schoolId: string, habitId: string, indicatorId: string | null, input: SaveIndicatorInput): Promise<HabitConfiguration> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    assertAccess(user, HABIT_CONFIG_PERMISSIONS.write); assertSchoolScope(user, schoolId);
    if (!input.name.trim()) throw new Error("Nama indikator wajib diisi.");
    const habit = configuration.habits.find((item) => item.id === habitId);
    if (!habit) throw new Error("Kebiasaan tidak ditemukan.");
    if (indicatorId) {
      const indicator = habit.indicators.find((item) => item.id === indicatorId);
      if (!indicator) throw new Error("Indikator tidak ditemukan.");
      indicator.name = input.name.trim(); indicator.description = input.description?.trim(); indicator.required = input.required; indicator.active = input.active;
    } else {
      const id = `indicator-${Date.now()}`;
      habit.indicators.push({ id, habitId, name: input.name.trim(), description: input.description?.trim(), order: habit.indicators.length + 1, required: input.required, active: input.active, options: [], conditions: [] });
    }
    configuration.updatedAt = now(); return structuredClone(configuration);
  },

  async saveOption(user: UserProfile, schoolId: string, habitId: string, indicatorId: string, optionId: string | null, input: SaveOptionInput): Promise<HabitConfiguration> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    assertAccess(user, HABIT_CONFIG_PERMISSIONS.write); assertSchoolScope(user, schoolId);
    if (!input.label.trim()) throw new Error("Label pilihan wajib diisi.");
    if (input.points < 0 || input.exp < 0) throw new Error("Poin dan EXP tidak boleh negatif.");
    const indicator = configuration.habits.find((h) => h.id === habitId)?.indicators.find((i) => i.id === indicatorId);
    if (!indicator) throw new Error("Indikator tidak ditemukan.");
    if (optionId) {
      const item = indicator.options.find((o) => o.id === optionId); if (!item) throw new Error("Pilihan tidak ditemukan.");
      item.label = input.label.trim(); item.points = input.points; item.exp = input.exp; item.active = input.active;
    } else {
      indicator.options.push({ id: `option-${Date.now()}`, label: input.label.trim(), points: input.points, exp: input.exp, order: indicator.options.length + 1, active: input.active });
    }
    configuration.updatedAt = now(); return structuredClone(configuration);
  },

  async saveCondition(user: UserProfile, schoolId: string, habitId: string, targetIndicatorId: string, input: SaveConditionInput): Promise<HabitConfiguration> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    assertAccess(user, HABIT_CONFIG_PERMISSIONS.write); assertSchoolScope(user, schoolId);
    if (input.sourceIndicatorId === targetIndicatorId) throw new Error("Indikator sumber dan indikator target harus berbeda.");
    const habit = configuration.habits.find((h) => h.id === habitId);
    const target = habit?.indicators.find((i) => i.id === targetIndicatorId);
    const source = habit?.indicators.find((i) => i.id === input.sourceIndicatorId);
    if (!target || !source) throw new Error("Indikator sumber/target tidak ditemukan.");
    if (source.order >= target.order) throw new Error("Conditional indicator harus bergantung pada indikator yang muncul sebelumnya.");
    if (!source.options.some((o) => o.id === input.sourceOptionId)) throw new Error("Pilihan kondisi tidak ditemukan.");
    target.conditions = [{ id: `condition-${Date.now()}`, sourceIndicatorId: input.sourceIndicatorId, operator: "equals", sourceOptionId: input.sourceOptionId }];
    configuration.updatedAt = now(); return structuredClone(configuration);
  },

  async removeCondition(user: UserProfile, schoolId: string, habitId: string, targetIndicatorId: string): Promise<HabitConfiguration> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    assertAccess(user, HABIT_CONFIG_PERMISSIONS.write); assertSchoolScope(user, schoolId);
    const target = configuration.habits.find((h) => h.id === habitId)?.indicators.find((i) => i.id === targetIndicatorId);
    if (!target) throw new Error("Indikator tidak ditemukan.");
    target.conditions = []; configuration.updatedAt = now(); return structuredClone(configuration);
  },

  async reorderHabits(user: UserProfile, schoolId: string, from: number, to: number): Promise<HabitConfiguration> {
    await new Promise((resolve) => setTimeout(resolve, 180));
    assertAccess(user, HABIT_CONFIG_PERMISSIONS.write); assertSchoolScope(user, schoolId);
    const [moved] = configuration.habits.splice(from, 1); configuration.habits.splice(to, 0, moved); configuration.habits.forEach((h, index) => h.order = index + 1);
    configuration.updatedAt = now(); return structuredClone(configuration);
  },

  async reorderIndicators(user: UserProfile, schoolId: string, habitId: string, from: number, to: number): Promise<HabitConfiguration> {
    await new Promise((resolve) => setTimeout(resolve, 180));
    assertAccess(user, HABIT_CONFIG_PERMISSIONS.write); assertSchoolScope(user, schoolId);
    const habit = configuration.habits.find((h) => h.id === habitId); if (!habit) throw new Error("Kebiasaan tidak ditemukan.");
    const [moved] = habit.indicators.splice(from, 1); habit.indicators.splice(to, 0, moved); habit.indicators.forEach((i, index) => i.order = index + 1);
    configuration.updatedAt = now(); return structuredClone(configuration);
  },

  async publish(user: UserProfile, schoolId: string): Promise<HabitConfiguration> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    assertAccess(user, HABIT_CONFIG_PERMISSIONS.write); assertSchoolScope(user, schoolId);
    if (configuration.habits.some((h) => h.active && h.indicators.some((i) => i.active && i.options.length === 0))) throw new Error("Setiap indikator aktif harus memiliki minimal satu pilihan.");
    configuration.version += 1; configuration.status = "published"; configuration.updatedAt = now(); return structuredClone(configuration);
  },
};
