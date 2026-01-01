/**
 * @file PredictionDashboard.tsx
 * @description YYC³ AI小语智能成长守护系统预测仪表板组件，提供预测结果可视化、性能监控和交互式分析功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterPlot, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

import type {
  PredictionResult,
  PredictionInsights,
  QualityMetrics,
  BiasReport,
  CalibrationResult,
  DataPoint,
  StreamingPrediction
} from '@/types/prediction/common'

interface PredictionDashboardProps {
  predictions: PredictionResult[]
  insights?: PredictionInsights
  qualityMetrics?: QualityMetrics
  biasReport?: BiasReport
  calibrationResult?: CalibrationResult
  streamingData?: StreamingPrediction[]
  onPredictionRequest?: (horizon: number, config?: PredictionConfig) => Promise<void>
  onModelUpdate?: () => Promise<void>
  isRealTime?: boolean
}

const PredictionDashboard: React.FC<PredictionDashboardProps> = ({
  predictions,
  insights,
  qualityMetrics,
  biasReport,
  calibrationResult,
  streamingData = [],
  onPredictionRequest,
  onModelUpdate,
  isRealTime = false
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d')
  const [showConfidenceBands, setShowConfidenceBands] = useState(true)
  const [chartType, setChartType] = useState<'line' | 'area' | 'scatter'>('line')
  const [predictionHorizon, setPredictionHorizon] = useState([5])
  const [isUpdating, setIsUpdating] = useState(false)

  // 过滤预测数据
  const filteredPredictions = useMemo(() => {
    if (selectedTimeRange === 'all') return predictions

    const now = Date.now()
    const ranges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }

    const cutoff = now - ranges[selectedTimeRange]
    return predictions.filter(p => p.timestamp >= cutoff)
  }, [predictions, selectedTimeRange])

  // 准备图表数据
  const chartData = useMemo(() => {
    const data = filteredPredictions.map(p => ({
      timestamp: new Date(p.timestamp).toLocaleString(),
      value: Array.isArray(p.prediction) ? p.prediction[0] : p.prediction,
      confidence: p.confidence,
      lower: p.confidenceInterval?.lower ? (Array.isArray(p.confidenceInterval.lower) ? p.confidenceInterval.lower[0] : p.confidenceInterval.lower) : null,
      upper: p.confidenceInterval?.upper ? (Array.isArray(p.confidenceInterval.upper) ? p.confidenceInterval.upper[0] : p.confidenceInterval.upper) : null,
      modelId: p.modelId,
      horizon: p.horizon
    }))

    // 添加流式数据
    streamingData.forEach(s => {
      data.push({
        timestamp: new Date(s.timestamp).toLocaleString(),
        value: s.prediction,
        confidence: s.confidence,
        modelId: s.modelVersion,
        horizon: 1,
        isStreaming: true
      })
    })

    return data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }, [filteredPredictions, streamingData])

  // 性能指标数据
  const performanceData = useMemo(() => {
    if (!qualityMetrics) return []

    return [
      { name: '准确度', value: qualityMetrics.accuracy * 100, fill: '#8884d8' },
      { name: '精确度', value: qualityMetrics.precision * 100, fill: '#82ca9d' },
      { name: '召回率', value: qualityMetrics.recall * 100, fill: '#ffc658' },
      { name: 'F1分数', value: qualityMetrics.f1Score * 100, fill: '#ff7300' }
    ]
  }, [qualityMetrics])

  // 处理预测请求
  const handlePredictionRequest = useCallback(async () => {
    if (!onPredictionRequest) return

    setIsUpdating(true)
    try {
      await onPredictionRequest(predictionHorizon[0])
    } catch (error) {
      console.error('预测请求失败:', error)
    } finally {
      setIsUpdating(false)
    }
  }, [onPredictionRequest, predictionHorizon])

  // 处理模型更新
  const handleModelUpdate = useCallback(async () => {
    if (!onModelUpdate) return

    setIsUpdating(true)
    try {
      await onModelUpdate()
    } catch (error) {
      console.error('模型更新失败:', error)
    } finally {
      setIsUpdating(false)
    }
  }, [onModelUpdate])

  return (
    <div className="space-y-6 p-6">
      {/* 头部控制面板 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">YYC³ 智能预测仪表板</h2>
          <p className="text-muted-foreground">
            实时监控预测性能、洞察分析模型表现
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="realtime-toggle">实时模式</Label>
            <Switch
              id="realtime-toggle"
              checked={isRealTime}
              disabled
            />
          </div>
          {onModelUpdate && (
            <Button onClick={handleModelUpdate} disabled={isUpdating}>
              {isUpdating ? '更新中...' : '更新模型'}
            </Button>
          )}
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">预测准确度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {qualityMetrics ? (qualityMetrics.accuracy * 100).toFixed(1) : '---'}%
            </div>
            <p className="text-xs text-muted-foreground">
              基于最近 {filteredPredictions.length} 次预测
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">平均置信度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filteredPredictions.length > 0
                ? (filteredPredictions.reduce((sum, p) => sum + p.confidence, 0) / filteredPredictions.length * 100).toFixed(1)
                : '---'}%
            </div>
            <p className="text-xs text-muted-foreground">
              预测可靠性指标
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">模型偏见</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {biasReport ?
                (biasReport.overall === 'low' ? '低' :
                 biasReport.overall === 'medium' ? '中' : '高') : '---'}
            </div>
            <p className="text-xs text-muted-foreground">
              公平性评估结果
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">漂移风险</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {insights?.riskAssessment?.overall ?
                (insights.riskAssessment.overall === 'low' ? '低' :
                 insights.riskAssessment.overall === 'medium' ? '中' : '高') : '---'}
            </div>
            <p className="text-xs text-muted-foreground">
              概念漂移风险评估
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 预测结果可视化 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>预测结果可视化</CardTitle>
              <CardDescription>
                查看预测趋势、置信区间和模型表现
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={chartType} onValueChange={(value: 'line' | 'area' | 'scatter') => setChartType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">折线图</SelectItem>
                  <SelectItem value="area">面积图</SelectItem>
                  <SelectItem value="scatter">散点图</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedTimeRange} onValueChange={(value: '24h' | '7d' | '30d' | 'all') => setSelectedTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24小时</SelectItem>
                  <SelectItem value="7d">7天</SelectItem>
                  <SelectItem value="30d">30天</SelectItem>
                  <SelectItem value="all">全部</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Switch
                  id="confidence-bands"
                  checked={showConfidenceBands}
                  onCheckedChange={setShowConfidenceBands}
                />
                <Label htmlFor="confidence-bands">置信区间</Label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                {showConfidenceBands && chartData[0]?.lower && (
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.1}
                    name="置信区间上限"
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                  name="预测值"
                />
                {showConfidenceBands && chartData[0]?.lower && (
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.1}
                    name="置信区间下限"
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#82ca9d"
                  strokeWidth={1}
                  dot={false}
                  name="置信度"
                  yAxisId="right"
                />
                <YAxis yAxisId="right" orientation="right" />
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  name="预测值"
                />
                {showConfidenceBands && chartData[0]?.lower && (
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.1}
                    name="置信区间"
                  />
                )}
              </AreaChart>
            ) : (
              <ScatterPlot data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis dataKey="value" />
                <Tooltip />
                <Legend />
                <Scatter dataKey="value" fill="#8884d8" name="预测值" />
              </ScatterPlot>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 预测洞察和分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 性能指标 */}
        <Card>
          <CardHeader>
            <CardTitle>性能指标</CardTitle>
            <CardDescription>
              模型在各维度上的表现评估
            </CardDescription>
          </CardHeader>
          <CardContent>
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                暂无性能数据
              </div>
            )}
          </CardContent>
        </Card>

        {/* 关键洞察 */}
        <Card>
          <CardHeader>
            <CardTitle>关键洞察</CardTitle>
            <CardDescription>
              基于预测结果的重要发现和建议
            </CardDescription>
          </CardHeader>
          <CardContent>
            {insights?.keyPoints ? (
              <div className="space-y-3">
                {insights.keyPoints.slice(0, 5).map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Badge variant={insight.severity === 'high' ? 'destructive' :
                                   insight.severity === 'medium' ? 'default' : 'secondary'}>
                      {insight.type}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm">{insight.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        置信度: {(insight.confidence * 100).toFixed(1)}% |
                        可操作性: {insight.actionability}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                暂无洞察数据
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 预测控制面板 */}
      {onPredictionRequest && (
        <Card>
          <CardHeader>
            <CardTitle>预测控制面板</CardTitle>
            <CardDescription>
              配置预测参数并生成新的预测
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>预测步长: {predictionHorizon[0]}</Label>
                <Slider
                  value={predictionHorizon}
                  onValueChange={setPredictionHorizon}
                  max={30}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handlePredictionRequest}
                  disabled={isUpdating}
                  className="w-full"
                >
                  {isUpdating ? '预测中...' : `生成未来 ${predictionHorizon[0]} 步预测`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 警报和通知 */}
      {insights?.driftAlerts && insights.driftAlerts.length > 0 && (
        <Alert>
          <AlertTitle>检测到性能警报</AlertTitle>
          <AlertDescription>
            {insights.driftAlerts.map((alert, index) => (
              <div key={index} className="mb-2">
                <Badge variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                  {alert.type}
                </Badge>
                <span className="ml-2">{alert.description}</span>
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default PredictionDashboard