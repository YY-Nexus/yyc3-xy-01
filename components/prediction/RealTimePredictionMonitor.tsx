/**
 * @file RealTimePredictionMonitor.tsx
 * @description YYC³ AI小语智能成长守护系统实时预测监控器，提供实时预测流监控、性能指标追踪和异常警报功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterPlot } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

import { Activity, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Clock, Cpu, Zap, Brain, Pause, Play } from 'lucide-react'

import type {
  StreamingPrediction,
  PredictionResult,
  DataStream,
  QualityMetrics,
  PredictionInsights,
  DataDriftMetrics
} from '@/types/prediction/common'

interface RealTimePredictionMonitorProps {
  isActive?: boolean
  streamData?: StreamingPrediction[]
  dataQuality?: StreamQualityMetrics
  performanceMetrics?: QualityMetrics
  driftAlerts?: DriftAlert[]
  onStreamToggle?: (active: boolean) => void
  onAlertAction?: (alertId: string, action: string) => void
  onModelUpdate?: () => Promise<void>
  maxDataPoints?: number
  refreshInterval?: number
}

interface PerformanceAlert {
  id: string
  type: 'performance' | 'drift' | 'quality' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: number
  acknowledged: boolean
  metrics?: Record<string, number>
}

interface DataHistoryItem {
  timestamp: number
  value: number
  confidence: number
  latency: number
  index: number
}

interface PerformanceHistoryItem {
  timestamp: number
  confidence: number
  accuracy: number
  latency: number
  error: number
}

const RealTimePredictionMonitor: React.FC<RealTimePredictionMonitorProps> = ({
  isActive = false,
  streamData = [],
  dataQuality,
  performanceMetrics,
  driftAlerts = [],
  onStreamToggle,
  onAlertAction,
  onModelUpdate,
  maxDataPoints = 100,
  refreshInterval = 1000
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1m' | '5m' | '15m' | '1h'>('5m')
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<'confidence' | 'accuracy' | 'latency' | 'error'>('confidence')
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy')

  const dataHistoryRef = useRef<DataHistoryItem[]>([])
  const performanceHistoryRef = useRef<PerformanceHistoryItem[]>([])

  // 实时数据处理
  const processedData = useMemo(() => {
    if (isPaused) return dataHistoryRef.current

    const now = Date.now()
    const ranges = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000
    }

    const cutoff = now - ranges[selectedTimeRange]
    const filteredData = streamData.filter(d => d.timestamp >= cutoff)

    // 处理数据用于图表显示
    const chartData = filteredData.map((data, index) => ({
      timestamp: new Date(data.timestamp).toLocaleTimeString(),
      value: data.prediction,
      confidence: data.confidence * 100,
      latency: data.processingTime,
      index: index,
      modelVersion: data.modelVersion,
      quality: data.dataQuality?.overallScore || 0
    }))

    dataHistoryRef.current = chartData.slice(-maxDataPoints)
    return dataHistoryRef.current
  }, [streamData, selectedTimeRange, isPaused, maxDataPoints])

  // 性能指标历史
  const performanceData = useMemo(() => {
    if (isPaused || !performanceMetrics) return performanceHistoryRef.current

    const timestamp = Date.now()
    const newPoint = {
      timestamp: new Date(timestamp).toLocaleTimeString(),
      confidence: performanceMetrics.accuracy * 100,
      accuracy: performanceMetrics.accuracy * 100,
      latency: Math.random() * 100, // 模拟延迟数据
      error: (1 - performanceMetrics.accuracy) * 100
    }

    performanceHistoryRef.current = [...performanceHistoryRef.current, newPoint].slice(-50)
    return performanceHistoryRef.current
  }, [performanceMetrics, isPaused])

  // 系统健康状态检查
  useEffect(() => {
    if (!performanceMetrics) return

    let status: 'healthy' | 'warning' | 'critical' = 'healthy'

    if (performanceMetrics.accuracy < 0.7) {
      status = 'critical'
    } else if (performanceMetrics.accuracy < 0.85) {
      status = 'warning'
    }

    if (alerts.some(a => a.severity === 'critical' && !a.acknowledged)) {
      status = 'critical'
    }

    setSystemStatus(status)
  }, [performanceMetrics, alerts])

  // 生成性能警报
  useEffect(() => {
    const newAlerts: PerformanceAlert[] = []

    // 检查性能下降
    if (performanceMetrics?.accuracy && performanceMetrics.accuracy < 0.75) {
      newAlerts.push({
        id: `perf_${Date.now()}`,
        type: 'performance',
        severity: performanceMetrics.accuracy < 0.6 ? 'critical' : 'medium',
        title: '预测准确度下降',
        description: `当前准确度 ${(performanceMetrics.accuracy * 100).toFixed(1)}% 低于阈值`,
        timestamp: Date.now(),
        acknowledged: false,
        metrics: { accuracy: performanceMetrics.accuracy }
      })
    }

    // 检查延迟问题
    const avgLatency = processedData.reduce((sum, d) => sum + d.latency, 0) / processedData.length
    if (avgLatency > 1000) { // 超过1秒
      newAlerts.push({
        id: `latency_${Date.now()}`,
        type: 'system',
        severity: avgLatency > 5000 ? 'critical' : 'medium',
        title: '预测延迟过高',
        description: `平均延迟 ${avgLatency.toFixed(0)}ms 超过预期`,
        timestamp: Date.now(),
        acknowledged: false,
        metrics: { latency: avgLatency }
      })
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts].slice(-10))
    }
  }, [performanceMetrics, processedData])

  // 自动刷新逻辑
  useEffect(() => {
    if (!autoRefresh || !isActive) return

    const interval = setInterval(() => {
      // 触发数据刷新逻辑
      if (onModelUpdate) {
        onModelUpdate().catch(console.error)
      }
    }, refreshInterval * 10) // 每10秒刷新一次

    return () => clearInterval(interval)
  }, [autoRefresh, isActive, refreshInterval, onModelUpdate])

  // 处理警报操作
  const handleAlertAction = useCallback((alertId: string, action: string) => {
    if (action === 'acknowledge') {
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ))
    }

    if (onAlertAction) {
      onAlertAction(alertId, action)
    }
  }, [onAlertAction])

  // 获取指标颜色
  const getMetricColor = useCallback((value: number, type: string) => {
    const thresholds = {
      confidence: { good: 80, warning: 60 },
      accuracy: { good: 85, warning: 70 },
      latency: { good: 500, warning: 1000 },
      error: { good: 10, warning: 20 }
    }

    const threshold = thresholds[type as keyof typeof thresholds]
    if (!threshold) return '#8884d8'

    if (type === 'latency' || type === 'error') {
      if (value <= threshold.good) return '#10b981' // green
      if (value <= threshold.warning) return '#f59e0b' // yellow
      return '#ef4444' // red
    } else {
      if (value >= threshold.good) return '#10b981' // green
      if (value >= threshold.warning) return '#f59e0b' // yellow
      return '#ef4444' // red
    }
  }, [])

  // 统计信息
  const statistics = useMemo(() => {
    if (processedData.length === 0) return null

    const values = processedData.map(d => d.value)
    const confidences = processedData.map(d => d.confidence)
    const latencies = processedData.map(d => d.latency)

    return {
      totalPredictions: processedData.length,
      avgValue: values.reduce((sum, v) => sum + v, 0) / values.length,
      avgConfidence: confidences.reduce((sum, c) => sum + c, 0) / confidences.length,
      avgLatency: latencies.reduce((sum, l) => sum + l, 0) / latencies.length,
      maxConfidence: Math.max(...confidences),
      minConfidence: Math.min(...confidences),
      maxLatency: Math.max(...latencies),
      minLatency: Math.min(...latencies)
    }
  }, [processedData])

  // 关键警报
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged)

  return (
    <div className="space-y-6 p-6">
      {/* 头部状态栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${systemStatus === 'healthy' ? 'bg-green-500' :
                                                             systemStatus === 'warning' ? 'bg-yellow-500' :
                                                             'bg-red-500'}`} />
            <span className="font-medium">
              系统状态: {systemStatus === 'healthy' ? '健康' :
                        systemStatus === 'warning' ? '警告' : '严重'}
            </span>
          </div>
          {isActive && (
            <Badge variant="outline" className="animate-pulse">
              <Activity className="w-3 h-3 mr-1" />
              实时监控中
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              disabled={!isActive}
            />
            <Label htmlFor="auto-refresh">自动刷新</Label>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onStreamToggle?.(!isActive)}
          >
            {isActive ? '停止监控' : '开始监控'}
          </Button>
        </div>
      </div>

      {/* 关键警报 */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">关键警报</AlertTitle>
          <AlertDescription className="text-red-700">
            <div className="space-y-2">
              {criticalAlerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="flex items-center justify-between">
                  <span>{alert.title}: {alert.description}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                  >
                    确认
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              预测数量
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statistics?.totalPredictions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              本时间窗口内
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              平均置信度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics ? (statistics.avgConfidence).toFixed(1) : '--'}%
            </div>
            <p className="text-xs text-muted-foreground">
              范围: {statistics ? `${statistics.minConfidence.toFixed(1)}% - ${statistics.maxConfidence.toFixed(1)}%` : '--'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              平均延迟
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statistics ? (statistics.avgLatency).toFixed(0) : '--'}ms
            </div>
            <p className="text-xs text-muted-foreground">
              范围: {statistics ? `${statistics.minLatency.toFixed(0)} - ${statistics.maxLatency.toFixed(0)}ms` : '--'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Cpu className="w-4 h-4 mr-2" />
              数据质量
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {dataQuality ? (dataQuality.overallScore * 100).toFixed(1) : '--'}%
            </div>
            <p className="text-xs text-muted-foreground">
              完整度: {dataQuality ? (dataQuality.completeness * 100).toFixed(1) : '--'}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 实时监控图表 */}
      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">实时预测</TabsTrigger>
          <TabsTrigger value="performance">性能监控</TabsTrigger>
          <TabsTrigger value="quality">数据质量</TabsTrigger>
          <TabsTrigger value="alerts">警报日志</TabsTrigger>
        </TabsList>

        {/* 实时预测 */}
        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>实时预测流</CardTitle>
                  <CardDescription>
                    监控实时预测值和置信度变化
                  </CardDescription>
                </div>
                <Select value={selectedTimeRange} onValueChange={(value: '1m' | '5m' | '15m' | '1h') => setSelectedTimeRange(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1分钟</SelectItem>
                    <SelectItem value="5m">5分钟</SelectItem>
                    <SelectItem value="15m">15分钟</SelectItem>
                    <SelectItem value="1h">1小时</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    name="预测值"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="confidence"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={false}
                    name="置信度"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 性能监控 */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>性能指标监控</CardTitle>
                  <CardDescription>
                    实时追踪模型性能指标变化
                  </CardDescription>
                </div>
                <Select value={selectedMetric} onValueChange={(value: 'confidence' | 'accuracy' | 'latency' | 'error') => setSelectedMetric(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confidence">置信度</SelectItem>
                    <SelectItem value="accuracy">准确度</SelectItem>
                    <SelectItem value="latency">延迟</SelectItem>
                    <SelectItem value="error">错误率</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke={getMetricColor(
                      performanceData[performanceData.length - 1]?.[selectedMetric] || 0,
                      selectedMetric
                    )}
                    strokeWidth={2}
                    dot={false}
                    name={selectedMetric === 'confidence' ? '置信度' :
                          selectedMetric === 'accuracy' ? '准确度' :
                          selectedMetric === 'latency' ? '延迟(ms)' : '错误率(%)'}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 数据质量 */}
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>数据质量监控</CardTitle>
              <CardDescription>
                监控输入数据质量指标和完整性
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dataQuality ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>完整性</Label>
                        <span>{(dataQuality.completeness * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={dataQuality.completeness * 100} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>一致性</Label>
                        <span>{(dataQuality.consistency * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={dataQuality.consistency * 100} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>准确性</Label>
                        <span>{(dataQuality.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={dataQuality.accuracy * 100} />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>缺失值模式</Label>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {dataQuality.missingPatterns ? Object.entries(dataQuality.missingPatterns)
                          .map(([key, value]) => `${key}: ${value}`).join(', ') : '无缺失值'}
                      </div>
                    </div>
                    <div>
                      <Label>异常值检测</Label>
                      <div className="mt-2 text-sm text-muted-foreground">
                        检测到 {dataQuality.anomalyCount || 0} 个异常值
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  暂无数据质量信息
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 警报日志 */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>警报日志</CardTitle>
              <CardDescription>
                系统警报和异常事件记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {alerts.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      暂无警报记录
                    </div>
                  ) : (
                    alerts.map(alert => (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          alert.severity === 'critical' ? 'bg-red-500' :
                          alert.severity === 'high' ? 'bg-orange-500' :
                          alert.severity === 'medium' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">{alert.title}</h4>
                            <Badge variant={alert.acknowledged ? 'secondary' : 'outline'}>
                              {alert.acknowledged ? '已确认' : '待处理'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                          >
                            确认
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default RealTimePredictionMonitor