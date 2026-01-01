/**
 * @file schedule.ts
 * @description YYC³ AI小语智能成长守护系统日程安排类型定义，定义日程管理、重复规则、提醒配置和日程同步的数据结构
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

export interface Schedule {
  id: string
  childId: string
  title: string
  description?: string
  type: ScheduleType
  startTime: Date
  endTime: Date
  repeat?: RepeatRule
  reminder?: ReminderConfig
  aiGenerated: boolean
  completed: boolean
  color: string
  createdAt: Date
  updatedAt: Date
}

export type ScheduleType = "study" | "rest" | "play" | "meal" | "sleep" | "exercise" | "class" | "homework" | "custom"

export interface RepeatRule {
  type: "daily" | "weekly" | "monthly" | "none"
  interval: number
  daysOfWeek?: number[]
  endDate?: Date
}

export interface ReminderConfig {
  enabled: boolean
  beforeMinutes: number[]
  methods: ("push" | "voice" | "toast")[]
}

export interface ScheduleFormData {
  title: string
  description?: string
  type: ScheduleType
  startTime: string
  endTime: string
  repeat: RepeatRule
  reminder: ReminderConfig
  color: string
}

export const SCHEDULE_TYPE_CONFIG: Record<ScheduleType, { label: string; icon: string; color: string }> = {
  study: { label: "学习", icon: "ri-book-open-line", color: "#3B82F6" },
  rest: { label: "休息", icon: "ri-zzz-line", color: "#10B981" },
  play: { label: "玩耍", icon: "ri-gamepad-line", color: "#F59E0B" },
  meal: { label: "用餐", icon: "ri-restaurant-line", color: "#EF4444" },
  sleep: { label: "睡眠", icon: "ri-moon-line", color: "#8B5CF6" },
  exercise: { label: "运动", icon: "ri-run-line", color: "#EC4899" },
  class: { label: "上课", icon: "ri-presentation-line", color: "#06B6D4" },
  homework: { label: "作业", icon: "ri-pencil-line", color: "#F97316" },
  custom: { label: "其他", icon: "ri-calendar-event-line", color: "#6B7280" },
}

export function getScheduleColor(type: ScheduleType): string {
  return SCHEDULE_TYPE_CONFIG[type]?.color || "#6B7280"
}

export function getScheduleIcon(type: ScheduleType): string {
  return SCHEDULE_TYPE_CONFIG[type]?.icon || "ri-calendar-event-line"
}

export function getScheduleLabel(type: ScheduleType): string {
  return SCHEDULE_TYPE_CONFIG[type]?.label || "其他"
}
