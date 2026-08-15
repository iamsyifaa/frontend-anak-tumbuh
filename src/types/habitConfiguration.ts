export type ConditionOperator = "equals";

export interface IndicatorOption {
  id: string;
  label: string;
  points: number;
  exp: number;
  order: number;
  active: boolean;
}

export interface IndicatorCondition {
  id: string;
  sourceIndicatorId: string;
  operator: ConditionOperator;
  sourceOptionId: string;
}

export interface HabitIndicator {
  id: string;
  habitId: string;
  name: string;
  description?: string;
  order: number;
  required: boolean;
  active: boolean;
  options: IndicatorOption[];
  conditions: IndicatorCondition[];
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  order: number;
  active: boolean;
  indicators: HabitIndicator[];
}

export interface HabitConfiguration {
  id: string;
  scope: "global" | "school";
  schoolId?: string;
  version: number;
  status: "draft" | "published";
  updatedAt: string;
  habits: Habit[];
}

export interface SaveHabitInput {
  name: string;
  description?: string;
  active: boolean;
}

export interface SaveIndicatorInput {
  name: string;
  description?: string;
  required: boolean;
  active: boolean;
}

export interface SaveOptionInput {
  label: string;
  points: number;
  exp: number;
  active: boolean;
}

export interface SaveConditionInput {
  sourceIndicatorId: string;
  sourceOptionId: string;
}
