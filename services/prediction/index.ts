/**
 * @file index.ts
 * @description YYC³ AI小语智能成长守护系统预测服务主入口，提供统一的预测服务接口和智能预测功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { DynamicModelSelector } from './model-selector'
import { PredictionQualityMonitor } from './quality-monitor'
import { EnsembleEngine } from '@/lib/prediction/adaptive-ensemble'
import { TimeSeriesEngine, AnomalyDetectionEngine, CausalInferenceEngine } from '@/lib/prediction/specialized-engines'
import type {
  PredictionData,
  PredictionConfig,
  PredictionTask,
  PredictionResult,
  PredictionInsights,
  StreamingPrediction,
  DataStream,
  QualityMetrics,
  BiasReport,
  CalibrationResult,
  ModelSelection,
  TaskStatus,
  Predictor,
  ModelInfo,
  PerformanceAnalysis,
  SensitiveData,
  TaskPredictorInfo,
  EnsembleEngine,
  RiskAssessment,
  InsightPoint,
  RiskFactor,
  DriftAlert,
  Recommendation
} from '@/types/prediction/common'

/**
 * 智能预测服务主类
 */
export class IntelligentPredictionService {
  private modelSelector: DynamicModelSelector
  private qualityMonitor: PredictionQualityMonitor
  private activePredictors: Map<string, TaskPredictorInfo> = new Map()
  private predictionHistory: PredictionResult[] = []

  constructor() {
    this.modelSelector = new DynamicModelSelector()
    this.qualityMonitor = new PredictionQualityMonitor()
  }

  /**
   * 创建智能预测任务
   */
  async createPredictionTask(
    config: PredictionConfig,
    data: PredictionData
  ): Promise<PredictionTask> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 自动确定任务类型
    const taskType = this.inferTaskType(data)

    // 智能选择最佳模型组合
    const modelSelection = await this.modelSelector.selectOptimalModel(
      data,
      { id: taskId, name: `智能预测任务_${taskId}`, type: taskType, description: '', priority: 'medium', constraints: config.constraints, requirements: config.requirements },
      config.constraints || {}
    )

    // 创建集成预测器
    const ensemble = await this.buildOptimalEnsemble(modelSelection, config)

    // 初始化预测器
    await this.initializePredictors(ensemble, data)

    const task: PredictionTask = {
      id: taskId,
      name: config.name || `智能预测任务_${taskId}`,
      type: taskType,
      description: `基于${modelSelection.selectedModel}的智能预测`,
      priority: config.priority || 'medium',
      constraints: config.constraints,
      requirements: config.requirements
    }

    // 保存任务信息
    this.activePredictors.set(taskId, {
      ensemble,
      config,
      data,
      modelSelection,
      createdAt: Date.now()
    })

    return task
  }

  /**
   * 执行预测
   */
  async executePrediction(
    taskId: string,
    data?: PredictionData,
    horizon?: number
  ): Promise<PredictionResult> {
    const taskInfo = this.activePredictors.get(taskId)
    if (!taskInfo) {
      throw new Error(`预测任务 ${taskId} 不存在`)
    }

    const { ensemble } = taskInfo
    const predictionData = data || taskInfo.data

    // 执行预测
    const result = await ensemble.predict(predictionData, horizon)

    // 保存预测历史
    this.predictionHistory.push(result)

    // 质量监控
    await this.qualityMonitor.recordPrediction(result)

    return result
  }

  /**
   * 实时流式预测
   */
  async executeRealTimePrediction(
    stream: DataStream,
    modelId?: string
  ): Promise<StreamingPrediction> {
    const startTime = Date.now()

    // 获取或创建适合流式预测的模型
    let predictor = modelId ? this.activePredictors.get(modelId) : null

    if (!predictor) {
      // 创建适合实时预测的时间序列模型
      const timeSeriesConfig = {
        name: 'realtime_timeseries',
        algorithm: 'exponential_smoothing',
        parameters: {
          alpha: 0.3,
          beta: 0.1,
          windowSize: Math.min(50, stream.data.length)
        }
      }

      predictor = new TimeSeriesEngine(timeSeriesConfig)
      await predictor.train(stream)

      const predictorId = `realtime_${Date.now()}`
      this.activePredictors.set(predictorId, { predictor, config: timeSeriesConfig })
    }

    // 执行预测
    const prediction = await predictor.predictor.predict(stream, 1)

    // 计算处理时间
    const processingTime = Date.now() - startTime

    const streamingPrediction: StreamingPrediction = {
      timestamp: Date.now(),
      prediction: Array.isArray(prediction.prediction) ? prediction.prediction[0] : prediction.prediction,
      confidence: prediction.confidence,
      processingTime,
      dataQuality: stream.qualityMetrics,
      modelVersion: predictor.predictor.getModelInfo().modelId
    }

    return streamingPrediction
  }

  /**
   * 生成预测洞察
   */
  async generatePredictionInsights(
    taskId: string,
    results?: PredictionResult[]
  ): Promise<PredictionInsights> {
    const taskInfo = this.activePredictors.get(taskId)
    const predictionResults = results || this.predictionHistory.slice(-10)

    if (!taskInfo) {
      throw new Error(`预测任务 ${taskId} 不存在`)
    }

    // 分析预测结果
    const performanceMetrics = await this.analyzePredictionPerformance(predictionResults)

    // 检测漂移
    const driftAlerts = await this.detectPredictionDrift(predictionResults)

    // 生成推荐
    const recommendations = await this.generateRecommendations(performanceMetrics, driftAlerts)

    // 风险评估
    const riskAssessment = this.assessPredictionRisk(performanceMetrics, driftAlerts)

    // 关键洞察点
    const keyPoints = this.extractKeyInsights(predictionResults, performanceMetrics)

    return {
      summary: this.generateInsightsSummary(performanceMetrics, driftAlerts, recommendations),
      keyPoints,
      performanceMetrics,
      driftAlerts,
      recommendations,
      riskAssessment,
      confidence: this.calculateOverallConfidence(performanceMetrics, driftAlerts)
    }
  }

  /**
   * 监控预测质量
   */
  async monitorPredictionQuality(results: PredictionResult[]): Promise<QualityMetrics> {
    return this.qualityMonitor.monitorPredictionAccuracy(
      results,
      results.map(r => Array.isArray(r.prediction) ? r.prediction[0] : r.prediction)
    )
  }

  /**
   * 检测预测偏见
   */
  async detectPredictionBias(
    results: PredictionResult[],
    sensitiveAttributes: SensitiveData
  ): Promise<BiasReport> {
    return this.qualityMonitor.detectPredictionBias(results, sensitiveAttributes)
  }

  /**
   * 校准预测不确定性
   */
  async calibratePredictionUncertainty(results: PredictionResult[]): Promise<CalibrationResult> {
    return this.qualityMonitor.calibratePredictionUncertainty(results)
  }

  /**
   * 更新模型
   */
  async updateModel(taskId: string, newData: PredictionData): Promise<void> {
    const taskInfo = this.activePredictors.get(taskId)
    if (!taskInfo) {
      throw new Error(`预测任务 ${taskId} 不存在`)
    }

    const { ensemble } = taskInfo

    // 检测概念漂移
    const driftDetection = await ensemble.detectConceptDrift?.(newData)

    if (driftDetection?.detected) {
      console.log(`检测到概念漂移: ${driftDetection.driftType}, 重新训练模型`)
    }

    // 重新训练模型
    await ensemble.train(newData)

    // 更新任务信息
    taskInfo.data = newData
    taskInfo.lastUpdated = Date.now()
  }

  /**
   * 获取任务状态
   */
  getTaskStatus(taskId: string): TaskStatus | null {
    const taskInfo = this.activePredictors.get(taskId)
    if (!taskInfo) {
      return null
    }

    return {
      taskId,
      modelInfo: taskInfo.ensemble.getModelInfo(),
      config: taskInfo.config,
      createdAt: taskInfo.createdAt,
      lastUpdated: taskInfo.lastUpdated,
      predictionCount: this.predictionHistory.filter(r => r.modelId.includes(taskId)).length
    }
  }

  /**
   * 列出所有活动任务
   */
  listActiveTasks(): string[] {
    return Array.from(this.activePredictors.keys())
  }

  /**
   * 删除任务
   */
  async deleteTask(taskId: string): Promise<void> {
    this.activePredictors.delete(taskId)
    // 清理相关的预测历史
    this.predictionHistory = this.predictionHistory.filter(r => !r.modelId.includes(taskId))
  }

  // 私有辅助方法

  private inferTaskType(data: PredictionData): 'regression' | 'classification' | 'forecasting' | 'anomaly_detection' {
    if (data.dataType === 'timeseries') {
      return 'forecasting'
    }

    // 简单的类型推断逻辑
    const values = data.data.slice(0, 10).map(p => p.value)
    const uniqueValues = new Set(values)

    if (uniqueValues.size <= 10 && values.length > 20) {
      return 'classification'
    }

    return 'regression'
  }

  private async buildOptimalEnsemble(
    modelSelection: ModelSelection,
    config: PredictionConfig
  ): Promise<EnsembleEngine> {
    const ensemble = new EnsembleEngine({
      name: 'optimal_ensemble',
      algorithm: 'adaptive_ensemble',
      parameters: {
        method: 'weighted',
        maxPredictors: config.constraints?.maxModels || 5
      }
    })

    // 根据选择的模型创建基础预测器
    for (const algorithm of [modelSelection.selectedModel, ...modelSelection.alternativeModels]) {
      try {
        const predictor = this.createPredictor(algorithm, config)
        ensemble.addPredictor(predictor)
      } catch (error) {
        console.warn(`创建预测器失败: ${algorithm}`, error)
      }
    }

    return ensemble
  }

  private async initializePredictors(
    ensemble: EnsembleEngine,
    data: PredictionData
  ): Promise<void> {
    await ensemble.train(data)
  }

  private createPredictor(algorithm: string, config: PredictionConfig): Predictor {
    const baseConfig = {
      name: algorithm,
      algorithm,
      parameters: config.parameters || {},
      preprocessing: config.preprocessing,
      validation: config.validation
    }

    switch (algorithm) {
      case 'time_series_exponential_smoothing':
        return new TimeSeriesEngine(baseConfig)
      case 'statistical_anomaly_detection':
        return new AnomalyDetectionEngine(baseConfig)
      case 'causal_inference':
        return new CausalInferenceEngine(baseConfig)
      default:
        return new TimeSeriesEngine(baseConfig)
    }
  }

  private async analyzePredictionPerformance(results: PredictionResult[]): Promise<PerformanceAnalysis> {
    if (results.length === 0) {
      return {
        accuracy: 0,
        confidence: 0,
        stability: 0,
        avgLatency: 0,
        predictionCount: 0
      }
    }

    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length
    const avgLatency = 0
    const stability = this.calculateStability(results)

    return {
      accuracy: avgConfidence,
      confidence: avgConfidence,
      stability,
      avgLatency,
      predictionCount: results.length
    }
  }

  private async detectPredictionDrift(results: PredictionResult[]): Promise<DriftAlert[]> {
    if (results.length < 10) return []

    const alerts: DriftAlert[] = []
    const recentResults = results.slice(-10)
    const olderResults = results.slice(-20, -10)

    if (olderResults.length > 0) {
      const recentAvgConfidence = recentResults.reduce((sum, r) => sum + r.confidence, 0) / recentResults.length
      const olderAvgConfidence = olderResults.reduce((sum, r) => sum + r.confidence, 0) / olderResults.length

      if (recentAvgConfidence < olderAvgConfidence * 0.8) {
        alerts.push({
          type: 'performance',
          severity: 'medium',
          description: '预测置信度下降',
          affectedFeatures: [],
          recommendedAction: '检查模型性能',
          timestamp: Date.now()
        })
      }
    }

    return alerts
  }

  private async generateRecommendations(metrics: PerformanceAnalysis, alerts: DriftAlert[]): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    if (metrics.confidence < 0.7) {
      recommendations.push({
        category: 'model_update',
        priority: 'high',
        description: '模型置信度较低，建议重新训练',
        expectedImpact: '提高预测准确度15-30%',
        effort: 'medium'
      })
    }

    if (alerts.length > 0) {
      recommendations.push({
        category: 'data_refresh',
        priority: 'medium',
        description: '检测到数据漂移，建议更新训练数据',
        expectedImpact: '改善模型适应性',
        effort: 'high'
      })
    }

    return recommendations
  }

  private assessPredictionRisk(metrics: PerformanceAnalysis, alerts: DriftAlert[]): RiskAssessment {
    let overall: 'low' | 'medium' | 'high' = 'low'
    const factors: RiskFactor[] = []
    const mitigation: string[] = []
    const monitoring: string[] = []

    if (metrics.confidence < 0.6) {
      overall = 'high'
      factors.push({
        type: 'model_performance',
        severity: 'high',
        description: '预测置信度过低',
        impact: '可能产生不可靠的预测结果'
      })
      mitigation.push('重新训练模型，增加数据量')
      monitoring.push('持续监控预测准确度')
    }

    if (alerts.length > 2) {
      overall = 'medium'
      factors.push({
        type: 'model_drift',
        severity: 'medium',
        description: '检测到多个性能问题',
        impact: '模型性能可能持续下降'
      })
    }

    return { overall, factors, mitigation, monitoring }
  }

  private extractKeyInsights(results: PredictionResult[], _metrics: PerformanceAnalysis): InsightPoint[] {
    const insights: InsightPoint[] = []

    if (results.length > 0) {
      const latestResult = results[results.length - 1]

      if (latestResult.confidence > 0.9) {
        insights.push({
          type: 'opportunity',
          description: '最新预测具有高置信度，可以作为重要决策依据',
          severity: 'low',
          confidence: latestResult.confidence,
          actionability: 'immediate'
        })
      }

      if (latestResult.confidence < 0.5) {
        insights.push({
          type: 'risk',
          description: '最新预测置信度较低，建议谨慎使用',
          severity: 'medium',
          confidence: 1 - latestResult.confidence,
          actionability: 'short_term'
        })
      }
    }

    return insights
  }

  private generateInsightsSummary(metrics: PerformanceAnalysis, alerts: DriftAlert[], recommendations: Recommendation[]): string {
    const summary: string[] = []

    if (metrics.confidence > 0.8) {
      summary.push('预测性能良好')
    } else if (metrics.confidence < 0.6) {
      summary.push('预测性能需要改进')
    }

    if (alerts.length > 0) {
      summary.push(`检测到${alerts.length}个性能问题`)
    }

    if (recommendations.length > 0) {
      summary.push(`有${recommendations.length}个改进建议`)
    }

    return summary.join('，') + '。'
  }

  private calculateOverallConfidence(metrics: PerformanceAnalysis, alerts: DriftAlert[]): number {
    let confidence = metrics.confidence || 0

    if (alerts.length > 0) {
      const penalty = alerts.reduce((sum, alert) => {
        return sum + (alert.severity === 'high' ? 0.2 : alert.severity === 'medium' ? 0.1 : 0.05)
      }, 0)
      confidence = Math.max(0, confidence - penalty)
    }

    return confidence
  }

  private calculateStability(results: PredictionResult[]): number {
    if (results.length < 2) return 1

    const confidences = results.map(r => r.confidence)
    const mean = confidences.reduce((a, b) => a + b, 0) / confidences.length
    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / confidences.length

    // 稳定性 = 1 - 变异系数
    const cv = Math.sqrt(variance) / mean
    return Math.max(0, 1 - cv)
  }
}