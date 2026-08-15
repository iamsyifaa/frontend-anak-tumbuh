import { UserProfile } from "../types/auth";
import { Habit, HabitConfiguration } from "../types/habitConfiguration";
import { HabitSubmissionInput, HabitSubmissionResult, StudentHabitConfigurationResponse } from "../types/habitSubmission";
import { habitConfigurationService } from "./habitConfigurationService";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API boundary. Production business rules belong to Laravel/backend.
const completedByStudent = new Map<string, Set<string>>();

function assertDigitalStudent(user: UserProfile) {
  if (user.role !== "siswa") throw new Error("Hanya akun siswa yang dapat mengisi Kebiasaan Digital.");
  if (user.method === "MANUAL") throw new Error("Siswa Manual tidak menggunakan form pengisian digital.");
}

function validateAnswers(habit: Habit, answers: HabitSubmissionInput["answers"]) {
  const activeIndicators = habit.indicators.filter((indicator) => indicator.active).sort((a, b) => a.order - b.order);
  const answerMap = new Map(answers.map((answer) => [answer.indicatorId, answer.optionId]));

  for (const indicator of activeIndicators) {
    const visible = indicator.conditions.length === 0 || indicator.conditions.every((condition) => {
      const sourceAnswer = answerMap.get(condition.sourceIndicatorId);
      return condition.operator === "equals" && sourceAnswer === condition.sourceOptionId;
    });
    if (!visible) continue;
    if (indicator.required && !answerMap.get(indicator.id)) {
      throw new Error(`Jawaban untuk "${indicator.name}" wajib diisi.`);
    }
    const selected = answerMap.get(indicator.id);
    if (selected && !indicator.options.some((option) => option.active && option.id === selected)) {
      throw new Error(`Pilihan pada "${indicator.name}" tidak valid.`);
    }
  }
}

export const habitSubmissionService = {
  async getStudentConfiguration(user: UserProfile, schoolId = user.schoolId): Promise<StudentHabitConfigurationResponse> {
    await delay(320);
    assertDigitalStudent(user);
    const configuration = await habitConfigurationService.getConfiguration(
      { ...user, permissions: [...user.permissions, "read:habit_config"] },
      schoolId,
    );
    const completedHabitIds = [...(completedByStudent.get(user.id) ?? new Set<string>())];
    return { configuration, completedHabitIds };
  },

  async submit(user: UserProfile, input: HabitSubmissionInput): Promise<HabitSubmissionResult> {
    await delay(500);
    assertDigitalStudent(user);
    if (input.studentId !== user.id) throw new Error("Anda hanya dapat mengisi data diri sendiri.");
    if (!input.habitId) throw new Error("Kebiasaan belum dipilih.");

    const configuration = await habitConfigurationService.getConfiguration(
      { ...user, permissions: [...user.permissions, "read:habit_config"] },
      user.schoolId,
    );
    const habit = configuration.habits.find((item) => item.id === input.habitId && item.active);
    if (!habit) throw new Error("Kebiasaan tidak ditemukan atau tidak aktif.");

    const completed = completedByStudent.get(user.id) ?? new Set<string>();
    if (completed.has(habit.id)) throw new Error("Kebiasaan ini sudah dikunci dan tidak dapat diisi ulang hari ini.");

    validateAnswers(habit, input.answers);
    if (input.reflection && input.reflection.length > 1000) throw new Error("Catatan maksimal 1000 karakter.");

    completed.add(habit.id);
    completedByStudent.set(user.id, completed);

    // Deliberately fixed mock response. Real points/EXP are calculated by backend.
    return {
      submissionId: `submission-${Date.now()}`,
      habitId: habit.id,
      locked: true,
      submittedAt: new Date().toISOString(),
      pointsAwarded: 0,
      expAwarded: 0,
    };
  },
};
