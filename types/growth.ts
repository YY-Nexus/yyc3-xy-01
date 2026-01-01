/**
 * @file growth.ts
 * @description YYC³ AI小语智能成长守护系统成长守护体系类型定义，定义年龄阶段、发展维度和成长记录相关的类型
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

export type AgeStage =
  | "0-3" // 感官启蒙期
  | "3-6" // 游戏化学习期
  | "6-9" // 学术奠基期
  | "9-12" // 思维建构期
  | "12-15" // 青春转型期
  | "15-18" // 生涯定位期
  | "18-22" // 成人成才期

export interface AgeStageConfig {
  id: AgeStage
  name: string
  subtitle: string
  ageRange: string
  color: string
  icon: string
  description: string
  focusAreas: string[]
  milestones: string[]
  developmentDimensions: DevelopmentDimension[]
}

export interface DevelopmentDimension {
  id: string
  name: string
  icon: string
  color: string
  description: string
  indicators: string[]
}

export interface GrowthRecord {
  id: string
  childId: string
  date: Date
  type: "milestone" | "observation" | "media" | "emotion"
  title: string
  content: string
  tags: string[]
  mediaUrls?: string[]
  emotionScore?: number
  ageStage: AgeStage
  dimensions?: string[]
}

export interface ChildProfile {
  id: string
  name: string
  nickname?: string
  birthDate: Date
  gender: "male" | "female" | "other"
  avatar?: string
  currentStage: AgeStage
  traits: string[]
  interests: string[]
}

export interface GrowthAssessment {
  id: string
  childId: string
  date: Date
  ageStage: AgeStage
  overallScore: number
  dimensionScores: Record<string, number>
  strengths: string[]
  improvements: string[]
  recommendations: string[]
  nextMilestones: string[]
}
