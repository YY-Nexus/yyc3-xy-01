'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  TrendingUp,
  Activity,
  Calendar,
  Award,
  Target,
  Brain,
  Heart,
  Eye,
  Ear,
  Hand,
  Foot,
  Star,
  Clock,
  Filter,
  Download,
  Share,
  Settings,
  Zap,
  Sparkles,
  Baby,
  Camera,
  BookOpen,
  Music,
  Gamepad2,
  Users,
  RefreshCw
} from 'lucide-react'

// 成长数据接口
interface GrowthData {
  date: string
  age: string
  weight: number // kg
  height: number // cm
  headCircumference: number // cm
  skills: {
    motor: number // 0-100
    cognitive: number
    language: number
    social: number
    emotional: number
  }
  activities: {
    sleep: number // hours
    feeding: number // times
    play: number // hours
    reading: number // times
    music: number // times
  }
  milestones: string[]
  mood: 'happy' | 'calm' | 'curious' | 'tired' | 'excited'
  photos: number
  notes: string
}

// 小语的成长数据
const xiaoyuGrowthData: GrowthData[] = [
  {
    date: '2024-12-27',
    age: '0天',
    weight: 3.2,
    height: 50,
    headCircumference: 34,
    skills: {
      motor: 10,
      cognitive: 15,
      language: 5,
      social: 20,
      emotional: 25
    },
    activities: {
      sleep: 18,
      feeding: 8,
      play: 1,
      reading: 0,
      music: 2
    },
    milestones: ['出生', '第一次哭声', '第一次睁眼'],
    mood: 'calm',
    photos: 25,
    notes: '小语来到世界的第一天，全家都激动得热泪盈眶'
  },
  {
    date: '2025-01-15',
    age: '19天',
    weight: 3.8,
    height: 52,
    headCircumference: 35,
    skills: {
      motor: 15,
      cognitive: 20,
      language: 10,
      social: 25,
      emotional: 30
    },
    activities: {
      sleep: 16,
      feeding: 7,
      play: 2,
      reading: 1,
      music: 3
    },
    milestones: ['第一次露出笑容', '能追踪移动的物体'],
    mood: 'happy',
    photos: 42,
    notes: '第一次对妈妈露出天使般的笑容，那一刻妈妈的心都融化了'
  },
  {
    date: '2025-02-27',
    age: '2个月',
    weight: 5.1,
    height: 56,
    headCircumference: 37,
    skills: {
      motor: 25,
      cognitive: 30,
      language: 20,
      social: 35,
      emotional: 40
    },
    activities: {
      sleep: 15,
      feeding: 6,
      play: 3,
      reading: 2,
      music: 4
    },
    milestones: ['抬头更稳', '发出咕咕声', '认出爸爸妈妈'],
    mood: 'curious',
    photos: 68,
    notes: '能清楚地认出爸爸妈妈，看到他们就会开心地笑'
  },
  {
    date: '2025-04-06',
    age: '100天',
    weight: 6.5,
    height: 62,
    headCircumference: 40,
    skills: {
      motor: 40,
      cognitive: 45,
      language: 35,
      social: 50,
      emotional: 55
    },
    activities: {
      sleep: 14,
      feeding: 5,
      play: 4,
      reading: 3,
      music: 5
    },
    milestones: ['翻身', '100天庆祝', '能抓住玩具'],
    mood: 'excited',
    photos: 120,
    notes: '小语100天啦！全家人为她举办了隆重的庆祝派对'
  },
  {
    date: '2025-06-27',
    age: '6个月',
    weight: 7.8,
    height: 68,
    headCircumference: 43,
    skills: {
      motor: 55,
      cognitive: 60,
      language: 50,
      social: 65,
      emotional: 70
    },
    activities: {
      sleep: 13,
      feeding: 4,
      play: 5,
      reading: 4,
      music: 6
    },
    milestones: ['坐立', '开始添加辅食', '认生'],
    mood: 'curious',
    photos: 180,
    notes: '开始添加辅食，对新的食物味道充满好奇'
  },
  {
    date: '2025-08-20',
    age: '8个月',
    weight: 8.5,
    height: 72,
    headCircumference: 44,
    skills: {
      motor: 70,
      cognitive: 75,
      language: 65,
      social: 75,
      emotional: 80
    },
    activities: {
      sleep: 12,
      feeding: 4,
      play: 6,
      reading: 5,
      music: 7
    },
    milestones: ['爬行', '叫妈妈', '拍手'],
    mood: 'happy',
    photos: 220,
    notes: '小语第一次成功爬行！这是她探索世界的重要一步'
  },
  {
    date: '2025-10-27',
    age: '10个月',
    weight: 9.2,
    height: 75,
    headCircumference: 45,
    skills: {
      motor: 80,
      cognitive: 85,
      language: 75,
      social: 85,
      emotional: 85
    },
    activities: {
      sleep: 11,
      feeding: 3,
      play: 7,
      reading: 6,
      music: 8
    },
    milestones: ['扶站', '理解简单指令', '挥手再见'],
    mood: 'excited',
    photos: 280,
    notes: '能扶着东西站立，对世界充满探索欲'
  },
  {
    date: '2025-12-14',
    age: '近1岁',
    weight: 9.8,
    height: 78,
    headCircumference: 46,
    skills: {
      motor: 90,
      cognitive: 90,
      language: 85,
      social: 90,
      emotional: 90
    },
    activities: {
      sleep: 11,
      feeding: 3,
      play: 8,
      reading: 7,
      music: 9
    },
    milestones: ['尝试独立行走', '说出多个词汇', '表达喜好'],
    mood: 'happy',
    photos: 350,
    notes: '即将迎来1岁生日，每天都有新的进步和惊喜'
  }
]

export default function GrowthDataVisualization() {
  const [selectedChart, setSelectedChart] = useState<'growth' | 'skills' | 'activities' | 'milestones'>('growth')
  const [timeRange, setTimeRange] = useState<'all' | '3m' | '6m' | '1y'>('all')
  const [selectedMetrics, setSelectedMetrics] = useState({
    weight: true,
    height: true,
    headCircumference: false
  })
  const [animatedData, setAnimatedData] = useState(xiaoyuGrowthData)

  // 根据时间范围筛选数据
  const filteredData = useMemo(() => {
    if (timeRange === 'all') return xiaoyuGrowthData

    const now = new Date('2025-12-14')
    const monthsAgo = {
      '3m': 3,
      '6m': 6,
      '1y': 12
    }[timeRange]

    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, now.getDate())

    return xiaoyuGrowthData.filter(item => new Date(item.date) >= cutoffDate)
  }, [timeRange])

  // 雷达图数据
  const radarData = useMemo(() => {
    const latest = filteredData[filteredData.length - 1]
    if (!latest) return []

    return [
      { skill: '运动能力', value: latest.skills.motor, fullMark: 100 },
      { skill: '认知能力', value: latest.skills.cognitive, fullMark: 100 },
      { skill: '语言能力', value: latest.skills.language, fullMark: 100 },
      { skill: '社交能力', value: latest.skills.social, fullMark: 100 },
      { skill: '情感发展', value: latest.skills.emotional, fullMark: 100 }
    ]
  }, [filteredData])

  // 活动数据
  const activityData = useMemo(() => {
    return filteredData.map(item => ({
      date: item.date.substring(5), // 只显示月-日
      age: item.age,
      睡眠: item.activities.sleep,
      游戏: item.activities.play,
      阅读: item.activities.reading,
      音乐: item.activities.music
    }))
  }, [filteredData])

  // 成就饼图数据
  const achievementData = useMemo(() => {
    const latest = filteredData[filteredData.length - 1]
    if (!latest) return []

    return [
      { name: '运动发展', value: latest.skills.motor, color: '#8B5CF6' },
      { name: '认知发展', value: latest.skills.cognitive, color: '#EC4899' },
      { name: '语言发展', value: latest.skills.language, color: '#F59E0B' },
      { name: '社交发展', value: latest.skills.social, color: '#10B981' },
      { name: '情感发展', value: latest.skills.emotional, color: '#3B82F6' }
    ]
  }, [filteredData])

  // 里程碑数据
  const milestoneTimeline = useMemo(() => {
    return filteredData.flatMap(item =>
      item.milestones.map((milestone, index) => ({
        date: item.date,
        age: item.age,
        milestone,
        type: index === 0 ? 'major' : 'minor'
      }))
    )
  }, [filteredData])

  // 动画效果
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(filteredData)
    }, 500)
    return () => clearTimeout(timer)
  }, [filteredData])

  // 导出数据
  const exportData = () => {
    const dataStr = JSON.stringify(filteredData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `小语成长数据_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 自定义 tooltip
  interface TooltipProps {
    active?: boolean
    payload?: Array<{
      name: string
      value: number
      color: string
    }>
    label?: string
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">{`日期: ${label}`}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.name.includes('身高') ? 'cm' : entry.name.includes('体重') ? 'kg' : ''}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 标题区域 */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 mb-4">
            📊 成长数据可视化
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            全面记录小语的成长轨迹，用数据见证每一个珍贵时刻
          </p>
        </motion.div>

        {/* 控制面板 */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* 图表类型选择 */}
            <div className="flex gap-2">
              {[
                { id: 'growth', label: '生长曲线', icon: TrendingUp },
                { id: 'skills', label: '能力雷达', icon: Brain },
                { id: 'activities', label: '活动分析', icon: Activity },
                { id: 'milestones', label: '里程碑', icon: Award }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedChart(id as 'growth' | 'skills' | 'activities' | 'milestones')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    selectedChart === id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* 时间范围选择 */}
            <div className="flex gap-2">
              {[
                { id: 'all', label: '全部' },
                { id: '1y', label: '1年' },
                { id: '6m', label: '6个月' },
                { id: '3m', label: '3个月' }
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTimeRange(id as 'all' | '3m' | '6m' | '1y')}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    timeRange === id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <button
                onClick={exportData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                导出
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Share className="w-4 h-4" />
                分享
              </button>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                设置
              </button>
            </div>
          </div>
        </motion.div>

        {/* 统计卡片 */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {[
            {
              label: '当前体重',
              value: `${animatedData[animatedData.length - 1]?.weight || 0} kg`,
              icon: '⚖️',
              change: '+0.3kg',
              color: 'from-blue-400 to-blue-600'
            },
            {
              label: '当前身高',
              value: `${animatedData[animatedData.length - 1]?.height || 0} cm`,
              icon: '📏',
              change: '+2cm',
              color: 'from-green-400 to-green-600'
            },
            {
              label: '照片总数',
              value: animatedData[animatedData.length - 1]?.photos || 0,
              icon: '📷',
              change: '+50',
              color: 'from-purple-400 to-purple-600'
            },
            {
              label: '里程碑',
              value: milestoneTimeline.length,
              icon: '🏆',
              change: '+2',
              color: 'from-orange-400 to-orange-600'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-4 shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-green-600 text-sm">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 图表显示区域 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedChart}
            className="bg-white rounded-2xl shadow-lg p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* 生长曲线图 */}
            {selectedChart === 'growth' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  生长曲线
                </h3>

                {/* 指标选择 */}
                <div className="flex gap-4 mb-6">
                  {[
                    { key: 'weight', label: '体重' },
                    { key: 'height', label: '身高' },
                    { key: 'headCircumference', label: '头围' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMetrics[key as keyof typeof selectedMetrics]}
                        onChange={(e) => setSelectedMetrics(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>

                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={animatedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="age"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {selectedMetrics.weight && (
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        name="体重 (kg)"
                        dot={{ fill: '#3B82F6', r: 6 }}
                        activeDot={{ r: 8 }}
                      />
                    )}
                    {selectedMetrics.height && (
                      <Line
                        type="monotone"
                        dataKey="height"
                        stroke="#10B981"
                        strokeWidth={3}
                        name="身高 (cm)"
                        dot={{ fill: '#10B981', r: 6 }}
                        activeDot={{ r: 8 }}
                      />
                    )}
                    {selectedMetrics.headCircumference && (
                      <Line
                        type="monotone"
                        dataKey="headCircumference"
                        stroke="#F59E0B"
                        strokeWidth={3}
                        name="头围 (cm)"
                        dot={{ fill: '#F59E0B', r: 6 }}
                        activeDot={{ r: 8 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 能力雷达图 */}
            {selectedChart === 'skills' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  能力发展雷达
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 雷达图 */}
                  <div>
                    <ResponsiveContainer width="100%" height={400}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#e0e0e0" />
                        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={{ fontSize: 10 }}
                        />
                        <Radar
                          name="能力值"
                          dataKey="value"
                          stroke="#8B5CF6"
                          fill="#8B5CF6"
                          fillOpacity={0.6}
                          strokeWidth={2}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 能力详情 */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">能力详情</h4>
                    <div className="space-y-4">
                      {radarData.map((skill, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium text-gray-700">
                            {skill.skill}
                          </div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <motion.div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.value}%` }}
                                transition={{ delay: index * 0.1, duration: 0.8 }}
                              />
                            </div>
                          </div>
                          <div className="w-12 text-right font-semibold text-gray-800">
                            {skill.value}%
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 发展建议 */}
                    <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                      <h5 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        发展建议
                      </h5>
                      <ul className="text-sm text-purple-600 space-y-1">
                        <li>• 继续加强精细动作训练，多进行抓握练习</li>
                        <li>• 增加语言输入，多和小语说话、唱儿歌</li>
                        <li>• 创造更多社交机会，让小语接触不同的人</li>
                        <li>• 鼓励探索精神，提供安全的探索环境</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 活动分析 */}
            {selectedChart === 'activities' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  日常活动分析
                </h3>

                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="睡眠"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="游戏"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="阅读"
                      stackId="1"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="音乐"
                      stackId="1"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                {/* 活动统计 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  {[
                    { icon: '😴', label: '平均睡眠', value: '11.5小时', color: 'blue' },
                    { icon: '🎮', label: '游戏时间', value: '5.5小时', color: 'green' },
                    { icon: '📚', label: '阅读次数', value: '4.2次/天', color: 'yellow' },
                    { icon: '🎵', label: '音乐活动', value: '5.8次/天', color: 'purple' }
                  ].map((stat, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-2">{stat.icon}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                      <div className="text-lg font-semibold text-gray-800">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 里程碑 */}
            {selectedChart === 'milestones' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-600" />
                  成长里程碑
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 里程碑时间线 */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">里程碑时间线</h4>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {milestoneTimeline.map((item, index) => (
                        <motion.div
                          key={index}
                          className={`flex gap-4 p-4 rounded-lg border-l-4 ${
                            item.type === 'major'
                              ? 'bg-orange-50 border-orange-400'
                              : 'bg-blue-50 border-blue-400'
                          }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex-shrink-0">
                            <div className={`w-3 h-3 rounded-full mt-1 ${
                              item.type === 'major' ? 'bg-orange-400' : 'bg-blue-400'
                            }`} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{item.milestone}</div>
                            <div className="text-sm text-gray-600">
                              {item.date} • {item.age}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* 成就分布 */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">能力发展分布</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={achievementData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {achievementData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* 最新成就 */}
                    <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                      <h5 className="font-semibold text-orange-700 mb-2">最新成就</h5>
                      <div className="space-y-2 text-sm text-orange-600">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          <span>尝试独立行走 - 运动能力大幅提升</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          <span>说出多个词汇 - 语言能力突破</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          <span>表达喜好 - 情感认知进步</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}