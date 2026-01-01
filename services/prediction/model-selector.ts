/**
 * @file model-selector.ts
 * @description YYC³ AI小语智能成长守护系统动态模型选择器，根据数据特征和任务需求智能选择最适合的模型
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import type {
  PredictionData,
  PredictionTask,
  ModelConstraints,
  ModelSelection,
  ModelFitAssessment,
  StabilityMetrics,
  BiasVarianceAnalysis,
  ResidualAnalysis
} from '@/types/prediction/common'

/**
 * 动态模型选择器
 */
export class DynamicModelSelector {
  private modelRegistry: Map<string, ModelInfo> = new Map()
  private selectionHistory: ModelSelection[] = []

  constructor() {
    this.initializeModelRegistry()
  }

  /**
   * 选择最优模型
   */
  async selectOptimalModel(
    data: PredictionData,
    task: PredictionTask,
    constraints: ModelConstraints
  ): Promise<ModelSelection> {
    const startTime = Date.now()

    // 分析数据特征
    const dataCharacteristics = this.analyzeDataCharacteristics(data)

    // 获取候选模型
    const candidateModels = this.getCandidateModels(task.type, dataCharacteristics, constraints)

    // 评估候选模型
    const modelAssessments: ModelFitAssessment[] = []
    for (const modelId of candidateModels) {
      try {
        const assessment = await this.evaluateModelFit(modelId, data)
        modelAssessments.push(assessment)
      } catch (error) {
        console.warn(`模型评估失败: ${modelId}`, error)
      }
    }

    // 选择最佳模型
    const bestModel = this.selectBestModel(modelAssessments, task, constraints)

    const selection: ModelSelection = {
      selectedModel: bestModel.modelId,
      alternativeModels: modelAssessments
        .filter(a => a.modelId !== bestModel.modelId)
        .slice(0, 3)
        .map(a => a.modelId),
      selectionReason: this.generateSelectionReason(bestModel, dataCharacteristics, task),
      expectedPerformance: bestModel.goodnessOfFit,
      confidence: this.calculateSelectionConfidence(bestModel),
      fittingTime: Date.now() - startTime
    }

    this.selectionHistory.push(selection)
    return selection
  }

  /**
   * 评估模型拟合度
   */
  async evaluateModelFit(
    modelId: string,
    data: PredictionData
  ): Promise<ModelFitAssessment> {
    const modelInfo = this.modelRegistry.get(modelId)
    if (!modelInfo) {
      throw new Error(`未找到模型: ${modelId}`)
    }

    // 简化的模型评估
    const dataComplexity = this.calculateDataComplexity(data)
    const modelComplexity = modelInfo.complexity

    const goodnessOfFit = this.calculateGoodnessOfFit(dataComplexity, modelComplexity, modelInfo)
    const stabilityMetrics = this.assessModelStability(modelInfo, data)
    const biasVarianceTradeoff = this.analyzeBiasVariance(dataComplexity, modelComplexity)

    const residualAnalysis = this.performResidualAnalysis(data)

    const recommendations = this.generateModelRecommendations(modelInfo, data, goodnessOfFit)

    return {
      modelId,
      goodnessOfFit,
      residualAnalysis,
      stabilityMetrics,
      biasVarianceTradeoff,
      recommendations
    }
  }

  /**
   * 分析数据特征
   */
  private analyzeDataCharacteristics(data: PredictionData): DataCharacteristics {
    const values = data.data.map(p => p.value)
    const features = data.features || []

    return {
      dataType: data.dataType,
      dataSize: data.data.length,
      featureCount: features.length,
      targetVariance: this.calculateVariance(values),
      targetRange: Math.max(...values) - Math.min(...values),
      missingValueRate: this.calculateMissingRate(data),
      isTimeSeries: data.dataType === 'timeseries',
      seasonality: data.dataType === 'timeseries' ? this.detectSeasonality(values) : null,
      trend: data.dataType === 'timeseries' ? this.detectTrend(values) : null,
      noiseLevel: this.estimateNoiseLevel(values),
      linearity: this.assessLinearity(data),
      outliers: this.detectOutliers(values),
      dataFrequency: data.frequency,
      timeHorizon: data.data.length
    }
  }

  /**
   * 获取候选模型
   */
  private getCandidateModels(
    taskType: string,
    dataCharacteristics: DataCharacteristics,
    constraints: ModelConstraints
  ): string[] {
    const candidates: string[] = []

    // 根据任务类型选择基础模型
    switch (taskType) {
      case 'forecasting':
        if (dataCharacteristics.isTimeSeries) {
          candidates.push(
            'time_series_exponential_smoothing',
            'time_series_arima',
            'time_series_lstm',
            'time_series_prophet'
          )

          if (dataCharacteristics.seasonality?.detected) {
            candidates.push('time_series_seasonal_decomposition')
          }

          if (dataCharacteristics.trend?.trend) {
            candidates.push('time_series_trend_model')
          }
        }
        break

      case 'anomaly_detection':
        candidates.push(
          'statistical_anomaly_detection',
          'isolation_forest',
          'local_outlier_factor',
          'one_class_svm'
        )
        break

      case 'classification':
        candidates.push(
          'random_forest_classifier',
          'gradient_boosting_classifier',
          'logistic_regression',
          'neural_network_classifier'
        )
        break

      case 'regression':
        candidates.push(
          'linear_regression',
          'random_forest_regressor',
          'gradient_boosting_regressor',
          'svr'
        )
        break
    }

    // 根据数据特征筛选模型
    return this.filterModelsByConstraints(candidates, dataCharacteristics, constraints)
  }

  /**
   * 根据约束条件筛选模型
   */
  private filterModelsByConstraints(
    models: string[],
    dataCharacteristics: DataCharacteristics,
    constraints: ModelConstraints
  ): string[] {
    return models.filter(modelId => {
      const modelInfo = this.modelRegistry.get(modelId)
      if (!modelInfo) return false

      // 训练时间约束
      if (constraints.maxTrainingTime && modelInfo.averageTrainingTime > constraints.maxTrainingTime) {
        return false
      }

      // 内存约束
      if (constraints.memoryLimit && modelInfo.memoryRequirement > constraints.memoryLimit) {
        return false
      }

      // 准确性要求
      if (constraints.accuracyThreshold && modelInfo.expectedAccuracy < constraints.accuracyThreshold) {
        return false
      }

      // 数据规模约束
      if (dataCharacteristics.dataSize < modelInfo.minDataPoints) {
        return false
      }

      // 实时性要求
      if (constraints.realTimeCapability && !modelInfo.supportsRealTime) {
        return false
      }

      return true
    })
  }

  /**
   * 选择最佳模型
   */
  private selectBestModel(
    assessments: ModelFitAssessment[],
    task: PredictionTask,
    _constraints: ModelConstraints
  ): ModelFitAssessment {
    if (assessments.length === 0) {
      throw new Error('没有可用的模型')
    }

    // 综合评分
    const scoredAssessments = assessments.map(assessment => {
      let score = assessment.goodnessOfFit * 0.4 // 拟合度权重
      score += assessment.stabilityMetrics.parameterStability * 0.3 // 稳定性权重
      score += assessment.stabilityMetrics.predictionStability * 0.2 // 预测稳定性权重

      // 根据任务优先级调整
      if (task.priority === 'urgent') {
        score += assessment.stabilityMetrics.sensitivity.complexity * 0.1 // 复杂度权重
      }

      return {
        ...assessment,
        score
      }
    })

    // 选择得分最高的模型
    return scoredAssessments.reduce((best, current) => current.score > best.score ? current : best)
  }

  /**
   * 生成选择原因
   */
  private generateSelectionReason(
    model: ModelFitAssessment,
    dataCharacteristics: DataCharacteristics,
    _task: PredictionTask
  ): string {
    const reasons = []

    if (model.goodnessOfFit > 0.8) {
      reasons.push('模型拟合度优秀')
    }

    if (model.stabilityMetrics.parameterStability > 0.7) {
      reasons.push('模型稳定性良好')
    }

    if (model.biasVarianceTradeoff.bias < 0.3 && model.biasVarianceTradeoff.variance < 0.3) {
      reasons.push('偏差方差平衡')
    }

    if (dataCharacteristics.dataType === 'timeseries' && model.residualAnalysis.autocorrelation < 0.2) {
      reasons.push('时间序列残差无自相关')
    }

    return reasons.join('，') || '综合评估最优'
  }

  /**
   * 计算选择置信度
   */
  private calculateSelectionConfidence(model: ModelFitAssessment): number {
    const factors = [
      model.goodnessOfFit,
      model.stabilityMetrics.parameterStability,
      model.stabilityMetrics.predictionStability,
      1 - model.biasVarianceTradeoff.totalError // 误差越小越好
    ]

    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length
  }

  // 辅助分析方法

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  }

  private calculateMissingRate(data: PredictionData): number {
    let totalValues = 0
    let missingValues = 0

    for (const point of data.data) {
      totalValues++
      if (point.features) {
        totalValues += Object.keys(point.features).length
        missingValues += Object.values(point.features).filter(v => v === null || isNaN(v)).length
      }
    }

    return totalValues > 0 ? missingValues / totalValues : 0
  }

  private detectSeasonality(values: number[]): SeasonalityInfo | null {
    if (values.length < 14) return null // 需要至少两周数据

    // 简化的季节性检测
    const periods = [7, 14, 30, 90]
    let bestPeriod = 0
    let bestCorrelation = 0

    for (const period of periods) {
      if (values.length >= period * 2) {
        const correlation = this.calculateSeasonalityCorrelation(values, period)
        if (correlation > bestCorrelation) {
          bestCorrelation = correlation
          bestPeriod = period
        }
      }
    }

    if (bestCorrelation > 0.3) {
      return {
        detected: true,
        period: bestPeriod,
        strength: bestCorrelation
      }
    }

    return null
  }

  private detectTrend(values: number[]): TrendInfo | null {
    if (values.length < 10) return null

    // 简单线性趋势检测
    const n = values.length
    const x = Array.from({ length: n }, (_, i) => i)
    const y = values

    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const r2 = this.calculateCorrelation(x, y) ** 2

    if (r2 > 0.3) {
      return {
        trend: slope > 0 ? 'increasing' : 'decreasing',
        strength: r2,
        slope
      }
    }

    return null
  }

  private estimateNoiseLevel(values: number[]): number {
    if (values.length < 2) return 1

    // 使用相邻差异的标准差作为噪声估计
    const differences = []
    for (let i = 1; i < values.length; i++) {
      differences.push(values[i] - values[i - 1])
    }

    const noiseVariance = this.calculateVariance(differences)
    const signalVariance = this.calculateVariance(values)

    return signalVariance > 0 ? noiseVariance / signalVariance : 0
  }

  private assessLinearity(data: PredictionData): number {
    if (!data.features || data.features.length === 0) return 0

    const features = data.features
    const targetValues = data.data.map(p => p.value)
    const firstFeature = data.data.map(p => p.features?.[features[0]] || 0)

    return Math.abs(this.calculateCorrelation(firstFeature, targetValues))
  }

  private detectOutliers(values: number[]): number {
    if (values.length === 0) return 0

    const stats = this.calculateStatistics(values)
    const threshold = stats.std * 2

    const outlierCount = values.filter(v => Math.abs(v - stats.mean) > threshold).length
    return outlierCount / values.length
  }

  private calculateStatistics(values: number[]): { mean: number; std: number } {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    return { mean, std: Math.sqrt(variance) }
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0

    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))

    return denominator === 0 ? 0 : numerator / denominator
  }

  private calculateSeasonalityCorrelation(values: number[], period: number): number {
    if (values.length < period * 2) return 0

    const correlations = []
    for (let lag = period; lag < Math.min(period * 3, values.length - period); lag += period) {
      const correlation = this.calculateCorrelation(
        values.slice(0, values.length - lag),
        values.slice(lag)
      )
      correlations.push(correlation)
    }

    return correlations.length > 0 ? correlations.reduce((a, b) => a + b, 0) / correlations.length : 0
  }

  private calculateDataComplexity(data: PredictionData): DataComplexity {
    return {
      size: data.data.length,
      features: data.features?.length || 0,
      variance: this.calculateVariance(data.data.map(p => p.value)),
      linearity: this.assessLinearity(data),
      noise: this.estimateNoiseLevel(data.data.map(p => p.value)),
      seasonality: data.dataType === 'timeseries' ? this.detectSeasonality(data.data.map(p => p.value)) : null,
      outliers: this.detectOutliers(data.data.map(p => p.value))
    }
  }

  private calculateGoodnessOfFit(
    dataComplexity: DataComplexity,
    modelComplexity: number,
    modelInfo: ModelInfo
  ): number {
    // 简化的拟合度计算
    const complexityMatch = 1 - Math.abs(dataComplexity.size - modelComplexity) / Math.max(dataComplexity.size, modelComplexity)
    const capabilityMatch = modelInfo.expectedAccuracy || 0.8

    return (complexityMatch + capabilityMatch) / 2
  }

  private assessModelStability(modelInfo: ModelInfo, _data: PredictionData): StabilityMetrics {
    return {
      parameterStability: modelInfo.stability,
      predictionStability: 0.8,
      temporalStability: 0.7,
      sensitivity: {
        noise: 0.3,
        complexity: modelInfo.complexity
      }
    }
  }

  private analyzeBiasVariance(dataComplexity: DataComplexity, modelComplexity: number): BiasVarianceAnalysis {
    const noise = dataComplexity.noise || 0.1
    const complexity = dataComplexity.size || 100

    const bias = Math.max(0.1, 1 - modelComplexity / 1000)
    const variance = noise + (modelComplexity / complexity) * 0.1

    return {
      bias,
      variance,
      irreducibleError: noise,
      totalError: bias + variance + noise,
      decomposition: 'bias2'
    }
  }

  private performResidualAnalysis(data: PredictionData): ResidualAnalysis {
    const values = data.data.map(p => p.value)
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const residuals = values.map(v => v - mean)

    return {
      meanError: 0,
      stdError: this.calculateStatistics(residuals).std,
      skewness: 0,
      kurtosis: 0,
      autocorrelation: 0.1,
      heteroscedasticity: false
    }
  }

  private generateModelRecommendations(
    modelInfo: ModelInfo,
    data: PredictionData,
    goodnessOfFit: number
  ): string[] {
    const recommendations = []

    if (goodnessOfFit < 0.6) {
      recommendations.push('考虑增加数据量或特征工程')
    }

    if (modelInfo.complexity > 0.8) {
      recommendations.push('模型较复杂，注意过拟合风险')
    }

    if (data.features && data.features.length < 5) {
      recommendations.push('考虑增加更多特征以提升模型性能')
    }

    return recommendations
  }

  private initializeModelRegistry(): void {
    // 初始化模型注册表
    this.modelRegistry.set('time_series_exponential_smoothing', {
      name: '指数平滑',
      type: 'forecasting',
      complexity: 0.3,
      expectedAccuracy: 0.8,
      averageTrainingTime: 100,
      memoryRequirement: 50,
      minDataPoints: 10,
      supportsRealTime: true,
      stability: 0.9
    })

    this.modelRegistry.set('time_series_arima', {
      name: 'ARIMA',
      type: 'forecasting',
      complexity: 0.7,
      expectedAccuracy: 0.85,
      averageTrainingTime: 500,
      memoryRequirement: 200,
      minDataPoints: 50,
      supportsRealTime: false,
      stability: 0.7
    })

    this.modelRegistry.set('statistical_anomaly_detection', {
      name: '统计异常检测',
      type: 'anomaly_detection',
      complexity: 0.4,
      expectedAccuracy: 0.9,
      averageTrainingTime: 200,
      memoryRequirement: 100,
      minDataPoints: 20,
      supportsRealTime: true,
      stability: 0.8
    })

    this.modelRegistry.set('random_forest_regressor', {
      name: '随机森林回归',
      type: 'regression',
      complexity: 0.6,
      expectedAccuracy: 0.85,
      averageTrainingTime: 1000,
      memoryRequirement: 300,
      minDataPoints: 50,
      supportsRealTime: false,
      stability: 0.9
    })

    this.modelRegistry.set('gradient_boosting_regressor', {
      name: '梯度提升回归',
      type: 'regression',
      complexity: 0.8,
      expectedAccuracy: 0.9,
      averageTrainingTime: 1500,
      memoryRequirement: 400,
      minDataPoints: 50,
      supportsRealTime: false,
      stability: 0.7
    })
  }
}

// 类型定义
interface ModelInfo {
  name: string
  type: string
  complexity: number
  expectedAccuracy: number
  averageTrainingTime: number
  memoryRequirement: number
  minDataPoints: number
  supportsRealTime: boolean
  stability: number
}

interface DataCharacteristics {
  dataType: string
  dataSize: number
  featureCount: number
  targetVariance: number
  targetRange: number
  missingValueRate: number
  isTimeSeries: boolean
  seasonality: SeasonalityInfo | null
  trend: TrendInfo | null
  noiseLevel: number
  linearity: number
  outliers: number
  dataFrequency?: string
  timeHorizon: number
}

interface SeasonalityInfo {
  detected: boolean
  period: number
  strength: number
}

interface TrendInfo {
  trend: 'increasing' | 'decreasing'
  strength: number
  slope: number
}

interface DataComplexity {
  size: number
  features: number
  variance: number
  linearity: number
  noise: number
  seasonality: SeasonalityInfo | null
  outliers: number
}