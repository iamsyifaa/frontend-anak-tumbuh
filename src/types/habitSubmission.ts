import { HabitConfiguration, Habit } from "./habitConfiguration";

export interface HabitSubmissionAnswer {
  indicatorId: string;
  optionId: string;
}

export interface HabitSubmissionInput {
  studentId: string;
  habitId: string;
  answers: HabitSubmissionAnswer[];
  reflection?: string;
}

export interface HabitSubmissionResult {
  submissionId: string;
  habitId: string;
  locked: boolean;
  submittedAt: string;
  // Backend-owned values. Frontend must only display them.
  pointsAwarded: number;
  expAwarded: number;
}

export interface StudentHabitConfigurationResponse {
  configuration: HabitConfiguration;
  completedHabitIds: string[];
}

export interface StudentHabitFormState {
  habit: Habit;
  answers: Record<string, string>;
  reflection: string;
}
