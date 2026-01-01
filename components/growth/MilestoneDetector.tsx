"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface MilestoneCandidate {
  type: string
  title: string
  significance: number
  ageRelevance: string
  celebration: string
}

interface MilestoneDetectorProps {
  content: string
  childAge: number
  onMilestoneDetected?: (milestone: MilestoneCandidate) => void
}

const MILESTONE_PATTERNS = [
  {
    keywords: ["第一次", "首次", "学会"],
    type: "first_achievement",
    significance: 9,
    celebration: "这是一个重要的第一次！",
  },
  {
    keywords: ["独立", "自己完成", "不需要帮助"],
    type: "independence",
    significance: 8,
    celebration: "独立能力的重要进步！",
  },
  {
    keywords: ["主动", "自发", "愿意"],
    type: "initiative",
    significance: 7,
    celebration: "主动性正在萌芽！",
  },
  {
    keywords: ["进步", "提高", "超过"],
    type: "progress",
    significance: 6,
    celebration: "持续进步中！",
  },
  {
    keywords: ["说", "表达", "告诉", "分享"],
    type: "communication",
    significance: 7,
    celebration: "表达能力的突破！",
  },
  {
    keywords: ["交朋友", "一起玩", "合作"],
    type: "social",
    significance: 7,
    celebration: "社交能力在发展！",
  },
  {
    keywords: ["坚持", "完成", "达成"],
    type: "perseverance",
    significance: 8,
    celebration: "毅力值得表扬！",
  },
]

const AGE_MILESTONES: Record<string, string[]> = {
  "0-1": ["翻身", "坐", "爬", "站", "叫爸妈", "走路"],
  "1-2": ["说话", "跑", "自己吃饭", "指认物品"],
  "2-3": ["说句子", "如厕", "穿衣", "分享", "想象游戏"],
  "3-4": ["画圆", "跳", "讲故事", "认颜色", "交朋友"],
  "4-5": ["写名字", "数数", "骑车", "系扣子"],
  "5-6": ["认字", "加减法", "独立阅读", "团队游戏"],
  "6-7": ["独立作业", "管理时间", "解决冲突"],
}

export default function MilestoneDetector({ content, childAge, onMilestoneDetected }: MilestoneDetectorProps) {
  const [detectedMilestones, setDetectedMilestones] = useState<MilestoneCandidate[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const detectMilestones = () => {
    if (!content.trim()) return

    setIsAnalyzing(true)
    const detected: MilestoneCandidate[] = []
    const lowerContent = content.toLowerCase()

    // 检测模式匹配
    for (const pattern of MILESTONE_PATTERNS) {
      const matched = pattern.keywords.some((kw) => lowerContent.includes(kw))
      if (matched) {
        detected.push({
          type: pattern.type,
          title: extractTitle(content, pattern.keywords),
          significance: pattern.significance,
          ageRelevance: getAgeRelevance(childAge),
          celebration: pattern.celebration,
        })
      }
    }

    // 检测年龄相关里程碑
    const ageGroup = getAgeGroup(childAge)
    const ageMilestones = AGE_MILESTONES[ageGroup] || []
    for (const milestone of ageMilestones) {
      if (lowerContent.includes(milestone)) {
        detected.push({
          type: "age_milestone",
          title: `达成年龄里程碑：${milestone}`,
          significance: 9,
          ageRelevance: `${ageGroup}岁关键发展`,
          celebration: `恭喜！这是${ageGroup}岁的重要里程碑！`,
        })
      }
    }

    setTimeout(() => {
      setDetectedMilestones(detected)
      setIsAnalyzing(false)
      if (detected.length > 0 && onMilestoneDetected) {
        onMilestoneDetected(detected[0])
      }
    }, 500)
  }

  const extractTitle = (text: string, keywords: string[]): string => {
    for (const kw of keywords) {
      const index = text.toLowerCase().indexOf(kw)
      if (index !== -1) {
        const start = Math.max(0, index - 10)
        const end = Math.min(text.length, index + kw.length + 20)
        return text.slice(start, end).trim()
      }
    }
    return text.slice(0, 30)
  }

  const getAgeGroup = (ageMonths: number): string => {
    const years = Math.floor(ageMonths / 12)
    if (years < 1) return "0-1"
    if (years < 2) return "1-2"
    if (years < 3) return "2-3"
    if (years < 4) return "3-4"
    if (years < 5) return "4-5"
    if (years < 6) return "5-6"
    return "6-7"
  }

  const getAgeRelevance = (ageMonths: number): string => {
    const years = Math.floor(ageMonths / 12)
    const months = ageMonths % 12
    return `${years}岁${months > 0 ? months + "个月" : ""}`
  }

  return (
    <div className="space-y-4">
      <motion.button
        onClick={detectMilestones}
        disabled={isAnalyzing || !content.trim()}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-medium disabled:opacity-50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isAnalyzing ? (
          <>
            <i className="ri-loader-4-line animate-spin" />
            分析中...
          </>
        ) : (
          <>
            <i className="ri-sparkling-line" />
            智能识别里程碑
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {detectedMilestones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <i className="ri-medal-line text-yellow-500" />
              检测到 {detectedMilestones.length} 个潜在里程碑
            </p>

            {detectedMilestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <i className="ri-trophy-line text-yellow-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-sm">{milestone.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{milestone.ageRelevance}</p>
                    <p className="text-sm text-yellow-700 mt-2">{milestone.celebration}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-400">重要程度</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < milestone.significance ? "bg-yellow-400" : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
