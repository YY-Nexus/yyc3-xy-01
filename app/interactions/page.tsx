"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navigation from "@/components/Navigation"
import PageHeader from "@/components/headers/PageHeader"
import { useInteractions } from "@/hooks/useInteractions"
import { useChildren } from "@/hooks/useChildren"
import ChildSelector from "@/components/ChildSelector"
import {
  type InteractionRecord,
  type InteractionType,
  type MoodType,
  INTERACTION_TYPE_CONFIG,
  MOOD_CONFIG,
  getInteractionConfig,
  getMoodConfig,
  calculateQualityLevel,
} from "@/types/interaction"

type ViewMode = "timeline" | "stats" | "calendar"
type FilterType = "all" | InteractionType

export default function InteractionsPage() {
  const [_viewMode, _setViewMode] = useState<ViewMode>("timeline")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [showEditor, setShowEditor] = useState(false)
  const [editingRecord, setEditingRecord] = useState<InteractionRecord | null>(null)

  const { currentChild } = useChildren()
  const { interactions, isLoading: _isLoading, stats, addInteraction, updateInteraction, deleteInteraction } = useInteractions()

  const filteredInteractions = useMemo(() => {
    if (filterType === "all") return interactions
    return interactions.filter((r) => r.type === filterType)
  }, [interactions, filterType])

  const handleAddRecord = () => {
    setEditingRecord(null)
    setShowEditor(true)
  }

  const handleEditRecord = (record: InteractionRecord) => {
    setEditingRecord(record)
    setShowEditor(true)
  }

  const handleSaveRecord = async (data: Omit<InteractionRecord, "id" | "aiAnalysis" | "createdAt" | "updatedAt">) => {
    if (editingRecord) {
      await updateInteraction(editingRecord.id, data)
    } else {
      await addInteraction(data)
    }
    setShowEditor(false)
    setEditingRecord(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <PageHeader icon="ri-heart-3-line" title="成长互动记录">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">记录每一次温暖陪伴</span>
        </div>
      </PageHeader>

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {currentChild && (
            <motion.div
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold">
                    {currentChild.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">与{currentChild.name}的互动</h3>
                    <p className="text-xs text-slate-500">本周 {stats.thisWeekRecords} 次互动</p>
                  </div>
                </div>
                <ChildSelector />
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: "总互动", value: stats.totalRecords, icon: "ri-heart-line", color: "from-pink-400 to-pink-500" },
              {
                label: "总时长",
                value: `${Math.round(stats.totalDuration / 60)}h`,
                icon: "ri-time-line",
                color: "from-blue-400 to-blue-500",
              },
              {
                label: "平均质量",
                value: `${stats.averageQuality}分`,
                icon: "ri-star-line",
                color: "from-yellow-400 to-yellow-500",
              },
              {
                label: "本周",
                value: stats.thisWeekRecords,
                icon: "ri-calendar-check-line",
                color: "from-green-400 to-green-500",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="bg-white rounded-xl p-3 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}
                >
                  <i className={`${stat.icon} text-white`} />
                </div>
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  filterType === "all" ? "bg-purple-500 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                全部
              </button>
              {(Object.keys(INTERACTION_TYPE_CONFIG) as InteractionType[]).slice(0, 5).map((type) => {
                const config = INTERACTION_TYPE_CONFIG[type]
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition flex items-center gap-1 ${
                      filterType === type ? "bg-purple-500 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <i className={config.icon} />
                    {config.label}
                  </button>
                )
              })}
            </div>

            <motion.button
              onClick={handleAddRecord}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium shadow-lg flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="ri-add-line" />
              记录互动
            </motion.button>
          </div>

          <div className="space-y-4">
            {filteredInteractions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <i className="ri-heart-add-line text-5xl text-slate-300 mb-3" />
                <p className="text-slate-500">还没有互动记录</p>
                <p className="text-sm text-slate-400">点击"记录互动"开始记录</p>
              </div>
            ) : (
              filteredInteractions.map((record, i) => (
                <InteractionCard
                  key={record.id}
                  record={record}
                  index={i}
                  onEdit={() => handleEditRecord(record)}
                  onDelete={() => deleteInteraction(record.id)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showEditor && (
          <InteractionEditor
            record={editingRecord}
            onSave={handleSaveRecord}
            onClose={() => {
              setShowEditor(false)
              setEditingRecord(null)
            }}
            childId={currentChild?.id || "default"}
          />
        )}
      </AnimatePresence>

      <Navigation />
    </div>
  )
}

function InteractionCard({
  record,
  index,
  onEdit,
  onDelete,
}: {
  record: InteractionRecord
  index: number
  onEdit: () => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const typeConfig = getInteractionConfig(record.type)
  const moodConfig = getMoodConfig(record.mood)
  const qualityLevel = record.aiAnalysis ? calculateQualityLevel(record.aiAnalysis.qualityScore) : null

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${typeConfig.bgColor} flex items-center justify-center`}>
              <i className={`${typeConfig.icon} ${typeConfig.color} text-xl`} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{record.title}</h3>
              <p className="text-xs text-slate-500">
                {typeConfig.label} · {record.duration}分钟 · {moodConfig.emoji}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {qualityLevel && <span className={`text-xs font-medium ${qualityLevel.color}`}>{qualityLevel.level}</span>}
            <button onClick={onEdit} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <i className="ri-edit-line text-slate-400" />
            </button>
            <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded-lg">
              <i className="ri-delete-bin-line text-red-400" />
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-3">{record.content}</p>

        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <span>
            <i className="ri-map-pin-line" /> {record.location || "未记录"}
          </span>
          <span>·</span>
          <span>
            <i className="ri-user-line" /> {record.participants.join("、")}
          </span>
          <span>·</span>
          <span>{new Date(record.createdAt).toLocaleDateString("zh-CN")}</span>
        </div>

        {record.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {record.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {record.aiAnalysis && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-purple-500 font-medium flex items-center gap-1"
          >
            <i className="ri-robot-line" />
            AI分析
            <i className={`ri-arrow-${expanded ? "up" : "down"}-s-line`} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && record.aiAnalysis && (
          <motion.div
            className="border-t bg-gradient-to-br from-purple-50 to-pink-50 p-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">互动质量</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                      style={{ width: `${record.aiAnalysis.qualityScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{record.aiAnalysis.qualityScore}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">情感倾向</p>
                <p className="text-sm font-medium text-slate-700">{record.aiAnalysis.sentiment}</p>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs text-slate-500 mb-1">关键词</p>
              <div className="flex flex-wrap gap-1">
                {record.aiAnalysis.keywords.map((kw) => (
                  <span key={kw} className="px-2 py-0.5 bg-white text-purple-600 rounded-full text-xs">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {record.aiAnalysis.suggestions.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1">建议</p>
                <ul className="space-y-1">
                  {record.aiAnalysis.suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                      <i className="ri-lightbulb-line text-yellow-500 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {record.aiAnalysis.milestoneDetected && (
              <div className="mt-3 p-2 bg-yellow-100 rounded-lg text-xs text-yellow-800 flex items-center gap-2">
                <i className="ri-trophy-line" />
                {record.aiAnalysis.milestoneDetected}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function InteractionEditor({
  record,
  onSave,
  onClose,
  childId,
}: {
  record: InteractionRecord | null
  onSave: (data: Omit<InteractionRecord, "id" | "aiAnalysis" | "createdAt" | "updatedAt">) => void
  onClose: () => void
  childId: string
}) {
  const [formData, setFormData] = useState({
    type: record?.type || ("play" as InteractionType),
    title: record?.title || "",
    content: record?.content || "",
    duration: record?.duration || 30,
    participants: record?.participants || ["妈妈"],
    location: record?.location || "",
    mood: record?.mood || ("good" as MoodType),
    tags: record?.tags || ([] as string[]),
    mediaUrls: record?.mediaUrls || ([] as string[]),
  })

  const [tagInput, setTagInput] = useState("")

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const handleSave = () => {
    if (!formData.title) return

    onSave({
      ...formData,
      childId,
      parentId: "parent_1",
    })
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">{record ? "编辑记录" : "记录互动"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">互动类型</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(INTERACTION_TYPE_CONFIG) as InteractionType[]).map((type) => {
                const config = INTERACTION_TYPE_CONFIG[type]
                return (
                  <button
                    key={type}
                    onClick={() => setFormData((prev) => ({ ...prev, type }))}
                    className={`p-2 rounded-xl text-center transition ${
                      formData.type === type
                        ? `${config.bgColor} ring-2 ring-offset-2 ring-purple-300`
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <i className={`${config.icon} ${config.color} text-xl`} />
                    <p className="text-xs mt-1">{config.label}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="给这次互动起个名字"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">详细描述</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
              rows={3}
              placeholder="记录这次互动的过程和感受..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">互动时长（分钟）</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData((prev) => ({ ...prev, duration: Number(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">地点</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="如：家里客厅"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">心情</label>
            <div className="flex gap-2">
              {(Object.keys(MOOD_CONFIG) as MoodType[]).map((mood) => {
                const config = MOOD_CONFIG[mood]
                return (
                  <button
                    key={mood}
                    onClick={() => setFormData((prev) => ({ ...prev, mood }))}
                    className={`flex-1 p-2 rounded-xl text-center transition ${
                      formData.mood === mood ? "bg-purple-100 ring-2 ring-purple-300" : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-xl">{config.emoji}</span>
                    <p className="text-xs mt-1">{config.label}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">标签</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                className="flex-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="输入标签按回车添加"
              />
              <button onClick={handleAddTag} className="px-3 py-2 bg-purple-500 text-white rounded-xl">
                添加
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          tags: prev.tags.filter((t) => t !== tag),
                        }))
                      }
                    >
                      <i className="ri-close-line" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 border rounded-xl font-medium hover:bg-slate-50">
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.title}
            className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium disabled:opacity-50"
          >
            保存
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
