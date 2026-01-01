"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navigation from "@/components/Navigation"
import PageHeader from "@/components/headers/PageHeader"
import { useCurriculum } from "@/hooks/useCurriculum"
import { useChildren } from "@/hooks/useChildren"
import ChildSelector from "@/components/ChildSelector"
import {
  type Course,
  type CourseSchedule,
  WEEKDAYS,
  TIME_SLOTS,
  COURSE_TYPES,
  SUBJECT_COLORS,
  formatTimeRange,
  calculateDuration,
} from "@/types/curriculum"

type ViewMode = "week" | "day" | "list"

export default function CurriculumPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("week")
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 7)
  const [showEditor, setShowEditor] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  const { currentChild } = useChildren()
  const {
    courses,
    semester,
    isLoading: _isLoading,
    stats,
    addCourse,
    updateCourse,
    deleteCourse,
    getCoursesByDay,
    checkConflicts,
  } = useCurriculum()

  const todayCourses = useMemo(() => getCoursesByDay(selectedDay), [getCoursesByDay, selectedDay])

  const handleAddCourse = () => {
    setEditingCourse(null)
    setShowEditor(true)
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setShowEditor(true)
  }

  const handleSaveCourse = (data: Omit<Course, "id" | "createdAt" | "updatedAt">) => {
    if (editingCourse) {
      updateCourse(editingCourse.id, data)
    } else {
      addCourse(data)
    }
    setShowEditor(false)
    setEditingCourse(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <PageHeader icon="ri-calendar-schedule-line" title="智能课程表">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">{semester.name}</span>
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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                    {currentChild.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{currentChild.name}的课程表</h3>
                    <p className="text-xs text-slate-500">本周共 {stats.weeklyClasses} 节课</p>
                  </div>
                </div>
                <ChildSelector />
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm">
              {(
                [
                  { mode: "week", icon: "ri-calendar-line", label: "周视图" },
                  { mode: "day", icon: "ri-calendar-event-line", label: "日视图" },
                  { mode: "list", icon: "ri-list-check-2", label: "列表" },
                ] as const
              ).map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                    viewMode === mode ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <i className={icon} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            <motion.button
              onClick={handleAddCourse}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium shadow-lg flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="ri-add-line" />
              添加课程
            </motion.button>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              {
                label: "校内课程",
                value: stats.schoolCourses,
                icon: "ri-school-line",
                color: "from-blue-400 to-blue-500",
              },
              {
                label: "兴趣班",
                value: stats.extraCourses,
                icon: "ri-palette-line",
                color: "from-purple-400 to-purple-500",
              },
              {
                label: "线上课程",
                value: stats.onlineCourses,
                icon: "ri-computer-line",
                color: "from-green-400 to-green-500",
              },
              {
                label: "本周课时",
                value: stats.weeklyClasses,
                icon: "ri-time-line",
                color: "from-orange-400 to-orange-500",
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

          {viewMode === "week" && (
            <WeeklyTimetable
              courses={courses}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              onEditCourse={handleEditCourse}
            />
          )}

          {viewMode === "day" && (
            <DailySchedule
              courses={todayCourses}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              onEditCourse={handleEditCourse}
            />
          )}

          {viewMode === "list" && (
            <CourseList courses={courses} onEditCourse={handleEditCourse} onDeleteCourse={deleteCourse} />
          )}
        </div>
      </main>

      <AnimatePresence>
        {showEditor && (
          <CourseEditor
            course={editingCourse}
            onSave={handleSaveCourse}
            onClose={() => {
              setShowEditor(false)
              setEditingCourse(null)
            }}
            checkConflicts={checkConflicts}
          />
        )}
      </AnimatePresence>

      <Navigation />
    </div>
  )
}

function WeeklyTimetable({
  courses,
  selectedDay,
  onSelectDay,
  onEditCourse,
}: {
  courses: Course[]
  selectedDay: number
  onSelectDay: (day: number) => void
  onEditCourse: (course: Course) => void
}) {
  const timeRange = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ]

  const getCourseAtSlot = (day: number, time: string) => {
    for (const course of courses) {
      if (!course.isActive) continue
      for (const schedule of course.schedules) {
        if (schedule.dayOfWeek === day && schedule.startTime === time) {
          return { course, schedule }
        }
      }
    }
    return null
  }

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="grid grid-cols-8 border-b">
        <div className="p-2 bg-slate-50 border-r" />
        {WEEKDAYS.map((day, i) => (
          <button
            key={day}
            onClick={() => onSelectDay(i + 1)}
            className={`p-2 text-center font-medium transition ${
              selectedDay === i + 1 ? "bg-blue-500 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {timeRange.map((time) => (
          <div key={time} className="grid grid-cols-8 border-b last:border-b-0 min-h-[50px]">
            <div className="p-2 text-xs text-slate-500 bg-slate-50 border-r flex items-center justify-center">
              {time}
            </div>
            {WEEKDAYS.map((_, i) => {
              const slot = getCourseAtSlot(i + 1, time)
              return (
                <div key={i} className="p-1 border-r last:border-r-0">
                  {slot && (
                    <motion.button
                      onClick={() => onEditCourse(slot.course)}
                      className="w-full h-full rounded-lg p-1 text-xs text-white font-medium"
                      style={{ backgroundColor: slot.course.color }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="truncate">{slot.course.name}</div>
                      <div className="text-[10px] opacity-80 truncate">{slot.schedule.room}</div>
                    </motion.button>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function DailySchedule({
  courses,
  selectedDay,
  onSelectDay,
  onEditCourse,
}: {
  courses: Course[]
  selectedDay: number
  onSelectDay: (day: number) => void
  onEditCourse: (course: Course) => void
}) {
  return (
    <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {WEEKDAYS.map((day, i) => (
          <motion.button
            key={day}
            onClick={() => onSelectDay(i + 1)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition ${
              selectedDay === i + 1 ? "bg-blue-500 text-white shadow-lg" : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {day}
          </motion.button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">
          {WEEKDAYS[selectedDay - 1]} · {courses.length} 节课
        </h3>

        {courses.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <i className="ri-calendar-line text-4xl mb-2" />
            <p>今天没有课程安排</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                onClick={() => onEditCourse(course)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="w-1 h-12 rounded-full" style={{ backgroundColor: course.color }} />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{course.name}</h4>
                  <p className="text-sm text-slate-500">
                    {course.schedules[0] && formatTimeRange(course.schedules[0].startTime, course.schedules[0].endTime)}
                    {course.teacher && ` · ${course.teacher}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-600">{course.schedules[0]?.room}</p>
                  <p className="text-xs text-slate-400">
                    {course.schedules[0] &&
                      calculateDuration(course.schedules[0].startTime, course.schedules[0].endTime)}
                    分钟
                  </p>
                </div>
                <i className="ri-arrow-right-s-line text-slate-400" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function CourseList({
  courses,
  onEditCourse,
  onDeleteCourse,
}: {
  courses: Course[]
  onEditCourse: (course: Course) => void
  onDeleteCourse: (id: string) => void
}) {
  const grouped = {
    school: courses.filter((c) => c.type === "school"),
    extracurricular: courses.filter((c) => c.type === "extracurricular"),
    online: courses.filter((c) => c.type === "online"),
  }

  return (
    <div className="space-y-4">
      {COURSE_TYPES.map(({ value, label, icon }) => (
        <motion.div
          key={value}
          className="bg-white rounded-2xl p-4 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <i className={`${icon} text-blue-500`} />
            {label}
            <span className="text-sm font-normal text-slate-400">({grouped[value]?.length || 0})</span>
          </h3>

          {grouped[value]?.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">暂无课程</p>
          ) : (
            <div className="space-y-2">
              {grouped[value]?.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: course.color }} />
                    <div>
                      <h4 className="font-medium text-slate-800">{course.name}</h4>
                      <p className="text-xs text-slate-500">
                        {course.teacher && `${course.teacher} · `}
                        {course.schedules.length} 节/周
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditCourse(course)}
                      className="p-2 rounded-lg hover:bg-slate-200 transition"
                    >
                      <i className="ri-edit-line text-slate-500" />
                    </button>
                    <button
                      onClick={() => onDeleteCourse(course.id)}
                      className="p-2 rounded-lg hover:bg-red-100 transition"
                    >
                      <i className="ri-delete-bin-line text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

function CourseEditor({
  course,
  onSave,
  onClose,
  checkConflicts,
}: {
  course: Course | null
  onSave: (data: Omit<Course, "id" | "createdAt" | "updatedAt">) => void
  onClose: () => void
  checkConflicts: (schedule: CourseSchedule, excludeId?: string) => Course[]
}) {
  const [formData, setFormData] = useState({
    name: course?.name || "",
    subject: course?.subject || "",
    teacher: course?.teacher || "",
    location: course?.location || "",
    type: course?.type || ("school" as Course["type"]),
    color: course?.color || "#3b82f6",
    notes: course?.notes || "",
    schedules: course?.schedules || ([] as CourseSchedule[]),
  })

  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "08:45",
    room: "",
  })

  const [conflicts, setConflicts] = useState<Course[]>([])

  const handleAddSchedule = () => {
    const schedule: CourseSchedule = {
      id: `sch_${Date.now()}`,
      ...newSchedule,
    }

    const foundConflicts = checkConflicts(schedule, course?.id)
    if (foundConflicts.length > 0) {
      setConflicts(foundConflicts)
      return
    }

    setFormData((prev) => ({
      ...prev,
      schedules: [...prev.schedules, schedule],
    }))
    setConflicts([])
  }

  const handleRemoveSchedule = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((s) => s.id !== id),
    }))
  }

  const handleSave = () => {
    if (!formData.name || !formData.subject) return

    onSave({
      ...formData,
      childId: course?.childId || "default",
      isActive: true,
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
          <h2 className="text-lg font-bold">{course ? "编辑课程" : "添加课程"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">课程名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="如：语文"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">学科</label>
              <select
                value={formData.subject}
                onChange={(e) => {
                  const subject = e.target.value
                  setFormData((prev) => ({
                    ...prev,
                    subject,
                    color: SUBJECT_COLORS[subject] || prev.color,
                  }))
                }}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">选择学科</option>
                {Object.keys(SUBJECT_COLORS).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">教师</label>
              <input
                type="text"
                value={formData.teacher}
                onChange={(e) => setFormData((prev) => ({ ...prev, teacher: e.target.value }))}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="如：李老师"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">课程类型</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as Course["type"] }))}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {COURSE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">上课时间</label>

            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              {formData.schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between bg-white p-2 rounded-lg">
                  <span className="text-sm">
                    {WEEKDAYS[schedule.dayOfWeek - 1]} {schedule.startTime}-{schedule.endTime}
                    {schedule.room && ` (${schedule.room})`}
                  </span>
                  <button onClick={() => handleRemoveSchedule(schedule.id)} className="p-1 hover:bg-red-100 rounded">
                    <i className="ri-close-line text-red-500" />
                  </button>
                </div>
              ))}

              <div className="grid grid-cols-5 gap-2 pt-2 border-t">
                <select
                  value={newSchedule.dayOfWeek}
                  onChange={(e) => setNewSchedule((prev) => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
                  className="px-2 py-1 border rounded-lg text-sm"
                >
                  {WEEKDAYS.map((day, i) => (
                    <option key={day} value={i + 1}>
                      {day}
                    </option>
                  ))}
                </select>
                <select
                  value={newSchedule.startTime}
                  onChange={(e) => setNewSchedule((prev) => ({ ...prev, startTime: e.target.value }))}
                  className="px-2 py-1 border rounded-lg text-sm"
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <select
                  value={newSchedule.endTime}
                  onChange={(e) => setNewSchedule((prev) => ({ ...prev, endTime: e.target.value }))}
                  className="px-2 py-1 border rounded-lg text-sm"
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newSchedule.room}
                  onChange={(e) => setNewSchedule((prev) => ({ ...prev, room: e.target.value }))}
                  className="px-2 py-1 border rounded-lg text-sm"
                  placeholder="教室"
                />
                <button onClick={handleAddSchedule} className="px-2 py-1 bg-blue-500 text-white rounded-lg text-sm">
                  添加
                </button>
              </div>

              {conflicts.length > 0 && (
                <div className="text-xs text-red-500 mt-1">时间冲突：{conflicts.map((c) => c.name).join(", ")}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={2}
              placeholder="选填"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 border rounded-xl font-medium hover:bg-slate-50">
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.name || !formData.subject}
            className="flex-1 py-2 bg-blue-500 text-white rounded-xl font-medium disabled:opacity-50"
          >
            保存
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
