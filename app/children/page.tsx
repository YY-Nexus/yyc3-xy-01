"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navigation from "@/components/Navigation"
import PageHeader from "@/components/headers/PageHeader"
import { db, type Child } from "@/lib/db/client"
import { useAuth } from "@/hooks/useAuth"
import { ChildQVersionAvatar, GenderSelector } from "@/components/ui/QVersionCharacter"

export default function ChildrenPage() {
  const { user } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)

  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async () => {
    setIsLoading(true)
    try {
      await db.seedMockData()
      const data = await db.findMany<Child>("children")
      setChildren(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("确定要删除该儿童档案吗？相关的成长记录也将被删除。")) {
      await db.delete("children", id)
      setChildren(children.filter((c) => c.id !== id))
    }
  }

  const calculateAge = (birthDate: string): string => {
    const birth = new Date(birthDate)
    const today = new Date()
    const years = today.getFullYear() - birth.getFullYear()
    const months = today.getMonth() - birth.getMonth()

    if (years < 1) {
      return `${Math.max(0, years * 12 + months)}个月`
    }
    return `${years}岁${months > 0 ? months + "个月" : ""}`
  }

  const getStageColor = (stage?: string): string => {
    const colors: Record<string, string> = {
      "0-3岁感官启蒙期": "bg-pink-100 text-pink-600",
      "3-6岁游戏学习期": "bg-purple-100 text-purple-600",
      "6-9岁学术奠基期": "bg-blue-100 text-blue-600",
      "9-12岁思维建构期": "bg-cyan-100 text-cyan-600",
      "12-15岁青春转型期": "bg-orange-100 text-orange-600",
      "15-18岁生涯定位期": "bg-amber-100 text-amber-600",
      "18-22岁成人成才期": "bg-green-100 text-green-600",
    }
    return colors[stage || ""] || "bg-slate-100 text-slate-600"
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-sky-50 to-white">
      <PageHeader title="儿童档案" subtitle="管理孩子的成长档案" showBack />

      <main className="flex-1 px-4 pb-24 pt-4">
        <div className="max-w-4xl mx-auto">
          {/* 添加按钮 */}
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="w-full mb-6 p-4 border-2 border-dashed border-blue-300 rounded-2xl text-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <i className="ri-add-circle-line text-2xl" />
            <span className="font-medium">添加孩子档案</span>
          </motion.button>

          {/* 儿童列表 */}
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">
              <i className="ri-loader-4-line animate-spin text-3xl" />
              <p className="mt-2">加载中...</p>
            </div>
          ) : children.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <i className="ri-user-smile-line text-6xl mb-4" />
              <p>还没有添加孩子档案</p>
              <p className="text-sm mt-1">点击上方按钮添加第一个档案</p>
            </div>
          ) : (
            <div className="space-y-4">
              {children.map((child) => (
                <motion.div
                  key={child.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start gap-4">
                    {/* Q版角色头像 */}
                    <ChildQVersionAvatar
                      child={{
                        id: child.id,
                        user_id: child.user_id,
                        name: child.name,
                        nickname: child.nickname || '',
                        birth_date: child.birth_date,
                        gender: child.gender === 'other' ? 'male' : child.gender,
                        created_at: child.created_at
                      }}
                      size="lg"
                    />

                    {/* 信息 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-800">{child.name}</h3>
                        {child.nickname && <span className="text-sm text-slate-400">({child.nickname})</span>}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${child.gender === "male" ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600"}`}
                        >
                          {child.gender === "male" ? "男" : "女"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm text-slate-500 mb-2">
                        <span className="flex items-center gap-1">
                          <i className="ri-cake-2-line" />
                          {calculateAge(child.birth_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-calendar-line" />
                          {child.birth_date}
                        </span>
                      </div>

                      {child.current_stage && (
                        <span className={`text-xs px-2 py-1 rounded-lg ${getStageColor(child.current_stage)}`}>
                          {child.current_stage}
                        </span>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingChild(child)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition"
                      >
                        <i className="ri-edit-line text-xl" />
                      </button>
                      <button
                        onClick={() => handleDelete(child.id)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition"
                      >
                        <i className="ri-delete-bin-line text-xl" />
                      </button>
                    </div>
                  </div>

                  {/* 快捷操作 */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                    <a
                      href={`/growth?child=${child.id}`}
                      className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg text-center text-sm hover:bg-blue-100 transition"
                    >
                      <i className="ri-line-chart-line mr-1" />
                      成长记录
                    </a>
                    <a
                      href={`/growth/assessment?child=${child.id}`}
                      className="flex-1 py-2 px-3 bg-purple-50 text-purple-600 rounded-lg text-center text-sm hover:bg-purple-100 transition"
                    >
                      <i className="ri-file-list-3-line mr-1" />
                      发展评估
                    </a>
                    <a
                      href={`/homework?child=${child.id}`}
                      className="flex-1 py-2 px-3 bg-orange-50 text-orange-600 rounded-lg text-center text-sm hover:bg-orange-100 transition"
                    >
                      <i className="ri-book-open-line mr-1" />
                      作业管理
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 添加/编辑弹窗 */}
      <AnimatePresence>
        {(showAddModal || editingChild) && (
          <ChildFormModal
            child={editingChild}
            onClose={() => {
              setShowAddModal(false)
              setEditingChild(null)
            }}
            onSave={async (data) => {
              if (editingChild) {
                await db.update<Child>("children", editingChild.id, data)
              } else {
                await db.create<Child>("children", {
                  name: data.name || "",
                  nickname: data.nickname,
                  birth_date: data.birth_date || "",
                  gender: data.gender || "male",
                  user_id: user?.id || "user-001",
                })
              }
              loadChildren()
              setShowAddModal(false)
              setEditingChild(null)
            }}
          />
        )}
      </AnimatePresence>

      <Navigation />
    </div>
  )
}

function ChildFormModal({
  child,
  onClose,
  onSave,
}: {
  child: Child | null
  onClose: () => void
  onSave: (data: Partial<Child>) => Promise<void>
}) {
  const [formData, setFormData] = useState<Partial<Child>>({
    name: child?.name || "",
    nickname: child?.nickname || "",
    birth_date: child?.birth_date || "",
    gender: child?.gender || "male",
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await onSave(formData)
    } finally {
      setIsSaving(false)
    }
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
        className="bg-white rounded-2xl p-6 w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-slate-800 mb-4">{child ? "编辑档案" : "添加孩子档案"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">昵称</label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="可选"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              出生日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              选择宝宝性别 <span className="text-red-500">*</span>
            </label>
            <GenderSelector
              value={formData.gender}
              onChange={(gender) => setFormData({ ...formData, gender })}
              size="md"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            >
              {isSaving ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
