/**
 * @file curriculum.ts
 * @description YYC³ AI小语智能成长守护系统课程表类型定义，定义课程管理、学期安排和时间表相关的类型
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

export interface Course {
  id: string
  childId: string
  name: string
  subject: string
  teacher: string
  location: string
  type: "school" | "extracurricular" | "online"
  color: string
  schedules: CourseSchedule[]
  notes: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CourseSchedule {
  id: string
  dayOfWeek: number // 1-7 (周一到周日)
  startTime: string // "08:00"
  endTime: string // "08:45"
  room: string
}

export interface Semester {
  id: string
  name: string
  startDate: Date
  endDate: Date
  isActive: boolean
}

export const SUBJECT_COLORS: Record<string, string> = {
  语文: "#10b981",
  数学: "#3b82f6",
  英语: "#8b5cf6",
  物理: "#f59e0b",
  化学: "#ef4444",
  生物: "#22c55e",
  历史: "#6366f1",
  地理: "#14b8a6",
  政治: "#ec4899",
  体育: "#f97316",
  音乐: "#a855f7",
  美术: "#06b6d4",
  科学: "#84cc16",
  编程: "#0ea5e9",
  舞蹈: "#d946ef",
  钢琴: "#64748b",
  书法: "#78716c",
  其他: "#94a3b8",
}

export const COURSE_TYPES = [
  { value: "school", label: "校内课程", icon: "ri-school-line" },
  { value: "extracurricular", label: "兴趣班", icon: "ri-palette-line" },
  { value: "online", label: "线上课程", icon: "ri-computer-line" },
] as const

export const WEEKDAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]

export const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
]

export function getSubjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] || SUBJECT_COLORS["其他"]
}

export function formatTimeRange(start: string, end: string): string {
  return `${start} - ${end}`
}

export function calculateDuration(start: string, end: string): number {
  const [startH, startM] = start.split(":").map(Number)
  const [endH, endM] = end.split(":").map(Number)
  return endH * 60 + endM - (startH * 60 + startM)
}

export function getDefaultSemester(): Semester {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  if (month >= 1 && month <= 6) {
    return {
      id: `${year}-spring`,
      name: `${year}年春季学期`,
      startDate: new Date(year, 1, 1),
      endDate: new Date(year, 6, 15),
      isActive: true,
    }
  } else {
    return {
      id: `${year}-fall`,
      name: `${year}年秋季学期`,
      startDate: new Date(year, 8, 1),
      endDate: new Date(year + 1, 0, 15),
      isActive: true,
    }
  }
}
