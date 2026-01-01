/**
 * @file GrowthDashboard.tsx
 * @description YYC³ AI小语智能成长守护系统成长仪表板组件，展示0-3岁婴幼儿成长记录和里程碑
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { milestoneTracker, GrowthAssessment, DevelopmentLevel, Milestone } from '@/lib/growth/milestone-tracker'
import { emotionEngine, EmotionType } from '@/lib/ai/emotion-engine'
import { voiceController } from '@/lib/ai/voice-interaction'
import { Child } from '@/types/common'
import { characterManager, type Child as CharacterChild } from '@/lib/character-manager'
import { reportError } from '@/lib/global-error-handler'

interface GrowthDashboardProps {
  child: Child & { age?: number }
}

export default function GrowthDashboard({ child }: GrowthDashboardProps) {
  const [assessment, setAssessment] = useState<GrowthAssessment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'emotions' | 'recommendations'>('overview')
  const [isRecording, setIsRecording] = useState(false)

  // 当前年龄（月）
  const ageInMonths = child.age || 12 // 默认12个月

  useEffect(() => {
    loadGrowthAssessment()
  }, [child.id || child.user_id, ageInMonths])

  const loadGrowthAssessment = async () => {
    try {
      setIsLoading(true)
      const childId = child.id || child.user_id || 'unknown'
      const newAssessment = milestoneTracker.generateGrowthAssessment(childId, ageInMonths)
      setAssessment(newAssessment)
    } catch (error) {
      const childId = child.id || child.user_id
      reportError(error as Error, { component: 'GrowthDashboard', action: 'loadAssessment', childId })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmotionAnalysis = async () => {
    if (isRecording) return

    try {
      setIsRecording(true)

      const childId = child.id || child.user_id
      if (!childId) {
        throw new Error('Child ID is required')
      }

      // 启动语音识别
      const result = await voiceController.startRecognition({
        recognitionMode: 'general',
        childAge: ageInMonths,
        emotion: EmotionType.HAPPINESS,
        sensitivity: 'medium',
        language: 'zh-CN'
      })

      // 分析情感
      const emotionResult = await emotionEngine.analyzeEmotion({
        text: result.transcript,
        context: {
          age: ageInMonths,
          timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon',
          recentActivities: ['growth-assessment'],
          environment: 'home'
        }
      })

      // TODO: 实现成长记录保存功能
      console.log('情感互动记录:', {
        childId,
        transcript: result.transcript,
        emotion: emotionResult.primary
      })

    } catch (error) {
      const childId = child.id || child.user_id
      reportError(error as Error, { component: 'GrowthDashboard', action: 'emotionAnalysis', childId })
    } finally {
      setIsRecording(false)
    }
  }

  const handleMilestoneAchievement = async (milestoneId: string, achieved: boolean) => {
    try {
      if (achieved) {
        const childId = child.id || child.user_id
        if (!childId) {
          throw new Error('Child ID is required')
        }

        // 记录里程碑达成
        const achievement = {
          childId,
          milestoneId: milestoneId,
          achievedDate: new Date().toISOString(),
          evidence: [],
          assessment: {
            score: 85,
            confidence: 0.9,
            evaluator: 'parent' as const,
            feedback: ['家长观察确认'],
            recommendations: ['继续观察相关发展']
          },
          notes: '通过家长观察确认达成',
          isEarly: false,
          isDelayed: false
        }

        milestoneTracker.recordAchievement(achievement)

        // TODO: 实现成长记录保存功能
        console.log('里程碑达成:', {
          childId,
          milestoneId: milestoneId
        })

        // 重新加载评估
        await loadGrowthAssessment()
      }
    } catch (error) {
      const childId = child.id || child.user_id
      reportError(error as Error, { component: 'GrowthDashboard', action: 'recordMilestone', childId })
    }
  }

  const getDevelopmentLevelColor = (level: DevelopmentLevel): string => {
    switch (level) {
      case DevelopmentLevel.ADVANCED: return 'text-green-600 bg-green-100'
      case DevelopmentLevel.ON_TRACK: return 'text-blue-600 bg-blue-100'
      case DevelopmentLevel.MILD_DELAY: return 'text-yellow-600 bg-yellow-100'
      case DevelopmentLevel.MODERATE_DELAY: return 'text-orange-600 bg-orange-100'
      case DevelopmentLevel.SIGNIFICANT_DELAY: return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDevelopmentLevelText = (level: DevelopmentLevel): string => {
    switch (level) {
      case DevelopmentLevel.ADVANCED: return '提前发展'
      case DevelopmentLevel.ON_TRACK: return '正常发展'
      case DevelopmentLevel.MILD_DELAY: return '轻微延迟'
      case DevelopmentLevel.MODERATE_DELAY: return '中度延迟'
      case DevelopmentLevel.SIGNIFICANT_DELAY: return '显著延迟'
      default: return '评估中'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">正在加载成长数据...</span>
      </div>
    )
  }

  // 获取角色配置
  const characterChild: CharacterChild | null = child.id ? {
    id: child.id,
    name: child.name,
    gender: child.gender
  } as CharacterChild : null
  const character = characterManager.getCharacterForUser(characterChild)
  const characterAvatar = characterManager.getCharacterImagePath(character, 'happy')

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 头部信息 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* 角色头像 */}
            <motion.div 
              className="w-16 h-16 rounded-full overflow-hidden border-4 border-blue-100 shadow-md"
              whileHover={{ scale: 1.1 }}
            >
              <img 
                src={characterAvatar} 
                alt={`${child.name || child.nickname} 的角色形象`} 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {child.name || child.nickname} 的成长记录
              </h1>
              <p className="text-gray-600 mt-1">
                年龄: {ageInMonths} 个月 | 当前阶段: {child.current_stage || '未知'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getDevelopmentLevelColor(assessment?.overallDevelopment || DevelopmentLevel.ON_TRACK)}`}>
              {getDevelopmentLevelText(assessment?.overallDevelopment || DevelopmentLevel.ON_TRACK)}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              最后评估: {new Date(assessment?.assessmentDate || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {['overview', 'milestones', 'emotions', 'recommendations'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'overview' | 'milestones' | 'emotions' | 'recommendations')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab === 'overview' && '总览'}
            {tab === 'milestones' && '里程碑'}
            {tab === 'emotions' && '情感记录'}
            {tab === 'recommendations' && '成长建议'}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <OverviewTab assessment={assessment} />}
          {activeTab === 'milestones' && <MilestonesTab child={child} onMilestoneAchievement={handleMilestoneAchievement} />}
          {activeTab === 'emotions' && <EmotionsTab child={child} isRecording={isRecording} onStartRecording={handleEmotionAnalysis} />}
          {activeTab === 'recommendations' && <RecommendationsTab assessment={assessment} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// 总览标签页
function OverviewTab({ assessment }: { assessment: GrowthAssessment | null }) {
  if (!assessment) return null

  const domainScores = [
    { name: '认知发展', score: assessment.domainScores.cognitive, color: 'bg-purple-500' },
    { name: '语言发展', score: assessment.domainScores.language, color: 'bg-blue-500' },
    { name: '运动发展', score: assessment.domainScores.motor, color: 'bg-green-500' },
    { name: '社交发展', score: assessment.domainScores.social, color: 'bg-yellow-500' },
    { name: '情感发展', score: assessment.domainScores.emotional, color: 'bg-pink-500' },
    { name: '自理能力', score: assessment.domainScores.selfCare, color: 'bg-indigo-500' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 领域得分 */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">发展领域得分</h2>
        <div className="space-y-4">
          {domainScores.map((domain) => (
            <div key={domain.name}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{domain.name}</span>
                <span className="text-sm font-bold text-gray-900">{domain.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${domain.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${domain.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 优势与成长领域 */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">发展分析</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-green-600 mb-2">优势领域</h3>
            <div className="flex flex-wrap gap-2">
              {assessment.strengths.map((strength, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {strength}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-orange-600 mb-2">需要关注</h3>
            <div className="flex flex-wrap gap-2">
              {assessment.areasForGrowth.map((area, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 里程碑标签页
function MilestonesTab({ child, onMilestoneAchievement }: { child: Child & { age?: number }; onMilestoneAchievement: (id: string, achieved: boolean) => void }) {
  const [milestones, setMilestones] = useState<Milestone[]>([])

  useEffect(() => {
    const age = child.age || 12 // 默认12个月
    const ageAppropriate = milestoneTracker.getAgeAppropriateMilestones(age)
    setMilestones(ageAppropriate)
  }, [child.age])

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">发展里程碑</h2>
      <div className="space-y-4">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{milestone.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                <div className="mt-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {milestone.ageRange.minMonths}-{milestone.ageRange.maxMonths}个月
                  </span>
                  <span className={`text-xs ml-2 px-2 py-1 rounded ${
                    milestone.importance === 'critical'
                      ? 'bg-red-100 text-red-700'
                      : milestone.importance === 'important'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {milestone.importance === 'critical' ? '重要' : milestone.importance === 'important' ? '关注' : '一般'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onMilestoneAchievement(milestone.id, true)}
                className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                标记达成
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 情感记录标签页
function EmotionsTab({ isRecording, onStartRecording }: { child: Child & { age?: number }; isRecording: boolean; onStartRecording: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">情感互动记录</h2>
      <div className="text-center">
        <div className="mb-6">
          <img
            src="/q-character/xiaoyu_lan.png"
            alt="小语"
            className="w-32 h-32 mx-auto rounded-full"
          />
        </div>
        <p className="text-gray-600 mb-6">
          点击下方按钮开始与小语进行语音互动，记录情感表达
        </p>
        <button
          onClick={onStartRecording}
          disabled={isRecording}
          className={`px-8 py-4 rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95 ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
          }`}
        >
          {isRecording ? (
            <>
              <div className="animate-pulse mr-2">🔴</div>
              正在录音...
            </>
          ) : (
            <>
              <div className="mr-2">🎤</div>
              开始语音互动
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// 成长建议标签页
function RecommendationsTab({ assessment }: { assessment: GrowthAssessment | null }) {
  if (!assessment || assessment.recommendations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <p className="text-gray-600">暂无个性化成长建议</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">个性化成长建议</h2>
      <div className="space-y-4">
        {assessment.recommendations.map((rec, index) => (
          <div
            key={index}
            className={`border-l-4 pl-4 py-3 ${
              rec.priority === 'high'
                ? 'border-red-500 bg-red-50'
                : rec.priority === 'medium'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-blue-500 bg-blue-50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{rec.title}</h3>
              <span className={`text-xs px-2 py-1 rounded ${
                rec.priority === 'high'
                  ? 'bg-red-100 text-red-700'
                  : rec.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {rec.priority === 'high' ? '高优先级' : rec.priority === 'medium' ? '中优先级' : '建议'}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-2">{rec.description}</p>
            <div className="flex items-center text-xs text-gray-500">
              <span>频率: {rec.timeframe}</span>
              {rec.resources.length > 0 && (
                <span className="ml-4">资源: {rec.resources.length} 个</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}