/**
 * @file AssessmentReport.tsx
 * @description YYC³ AI小语智能成长守护系统评估报告组件，提供儿童成长评估报告生成和展示
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import type { ReportData } from "@/lib/pdf_generator"

// PDF生成器导入状态
interface PDFGeneratorModule {
  PDFGenerator: new () => {
    downloadReport(data: ReportData, filename?: string): Promise<void>
  }
}

let PDFGeneratorModule: PDFGeneratorModule | null = null

// 动态导入PDFGenerator以避免SSR错误
const loadPDFGenerator = async () => {
  if (!PDFGeneratorModule) {
    PDFGeneratorModule = await import("@/lib/pdf_generator")
  }
  return PDFGeneratorModule.PDFGenerator
}

interface DimensionScore {
  score: number
  level: string
  percentile: number
  description: string
}

interface AssessmentReportProps {
  result?: {
    id: string
    childName: string
    childAge: number
    stageName: string
    assessmentDate: string
    dimensionScores: Record<string, DimensionScore>
    overallLevel: string
    aiAnalysis: string
    recommendations: string[]
    nextSteps: string[]
  }
  report?: {
    id: string
    childName: string
    childAge: number
    stageName: string
    assessmentDate: string
    dimensionScores: Record<string, DimensionScore>
    overallLevel: string
    aiAnalysis: string
    recommendations: string[]
    nextSteps: string[]
  }
  onClose?: () => void
}

export default function AssessmentReport({ result, report, onClose }: AssessmentReportProps) {
  const reportData = result || report
  const [activeTab, setActiveTab] = useState<"overview" | "dimensions" | "suggestions">("overview")
  const [isExporting, setIsExporting] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 bg-green-50"
    if (score >= 70) return "text-blue-600 bg-blue-50"
    if (score >= 55) return "text-yellow-600 bg-yellow-50"
    return "text-orange-600 bg-orange-50"
  }

  const getBarColor = (score: number) => {
    if (score >= 85) return "bg-green-500"
    if (score >= 70) return "bg-blue-500"
    if (score >= 55) return "bg-yellow-500"
    return "bg-orange-500"
  }

  const handleExportPDF = async () => {
    setIsExporting(true)

    try {
      // 动态加载PDFGenerator
      const PDFGenerator = await loadPDFGenerator()
      
      const pdfGenerator = new PDFGenerator()

      const reportData: ReportData = {
        childName: report?.childName || '',
        childAge: report?.childAge || 0,
        stageName: report?.stageName || '',
        assessmentDate: report?.assessmentDate || '',
        overallLevel: report?.overallLevel || '',
        aiAnalysis: report?.aiAnalysis || '',
        dimensionScores: report?.dimensionScores ? Object.fromEntries(
          Object.entries(report.dimensionScores).map(([key, value]) => [
            key,
            { score: value.score, level: value.level, description: value.description },
          ]),
        ) : {},
        recommendations: report?.recommendations || [],
      }

      await pdfGenerator.downloadReport(reportData)
    } catch (error) {
      console.error("PDF导出失败:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="bg-linear-to-r from-blue-500 to-purple-500 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">发展评估报告</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
              <i className="ri-close-line text-xl" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-user-smile-line text-3xl" />
            </div>
            <div>
              <h3 className="text-lg font-medium">{reportData?.childName || ''}</h3>
              <p className="text-white/80">
                {reportData?.childAge || 0}个月龄 · {reportData?.stageName || ''}
              </p>
              <p className="text-sm text-white/60">
                评估日期：{reportData?.assessmentDate ? new Date(reportData.assessmentDate).toLocaleDateString("zh-CN") : ''}
              </p>
            </div>
          </div>
          <div className="mt-4 bg-white/20 rounded-xl p-3 flex items-center gap-3">
            <i className="ri-award-line text-2xl" />
            <div>
              <p className="text-sm text-white/80">总体发展水平</p>
              <p className="font-bold text-lg">{reportData?.overallLevel || ''}</p>
            </div>
          </div>
        </div>

        {/* Tab切换 */}
        <div className="flex border-b">
          {[
            { id: "overview", label: "综合分析", icon: "ri-file-chart-line" },
            { id: "dimensions", label: "维度详情", icon: "ri-bar-chart-grouped-line" },
            { id: "suggestions", label: "成长建议", icon: "ri-lightbulb-line" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "overview" | "dimensions" | "suggestions")}
              className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <i className={tab.icon} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区 */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="prose prose-sm max-w-none">
                  {(reportData?.aiAnalysis || '').split("\n").map((paragraph, i) => (
                    <p key={i} className="text-slate-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "dimensions" && (
              <motion.div
                key="dimensions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {Object.entries(reportData?.dimensionScores || {}).map(([dimension, data]) => (
                  <div key={dimension} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-800">{dimension}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(data.score)}`}>
                        {data.level}
                      </span>
                    </div>
                    <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.score}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`absolute left-0 top-0 h-full rounded-full ${getBarColor(data.score)}`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{data.description}</span>
                      <span>得分: {data.score} / 100</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === "suggestions" && (
              <motion.div
                key="suggestions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                    <i className="ri-star-line text-yellow-500" />
                    专家建议
                  </h4>
                  <ul className="space-y-2">
                    {(reportData?.recommendations || []).map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                    <i className="ri-footprint-line text-green-500" />
                    下一步行动
                  </h4>
                  <ul className="space-y-2">
                    {(reportData?.nextSteps || []).map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <i className="ri-checkbox-circle-line text-green-500 mt-0.5" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部操作 */}
        <div className="border-t p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            关闭
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <i className="ri-loader-4-line animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <i className="ri-download-line" />
                导出报告
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
