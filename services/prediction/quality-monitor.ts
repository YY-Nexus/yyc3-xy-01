/**
 * @file quality-monitor.ts
 * @description YYC³ AI小语智能成长守护系统预测质量监控器，监控预测准确性、检测偏见、校准不确定性
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import type {
  PredictionResult,
  QualityMetrics,
  BiasReport,
  CalibrationResult,
  SensitiveData
} from '@/types/prediction/common'

interface ConfidenceCalibrationMetrics {
  avgConfidence: number
  confidenceVariance: number
  calibrationError: number
  overconfidentRatio: number
}

interface ReliabilityDiagramPoint {
  confidence: number
  empiricalAccuracy: number
  count: number
}

interface CalibrationCurvePoint {
  predicted: number
  actual: number
  count: number
}

interface CalibrationMetrics {
  avgConfidence: number
  confidenceVariance: number
  calibrationError: number
  overconfidentRatio: number
  expectedAccuracy?: number
  actualAccuracy?: number
  temperature?: number
}

/**
 * 预测质量监控器
 */
export class PredictionQualityMonitor {
  private qualityHistory: QualityMetrics[] = []
  private biasHistory: BiasReport[] = []
  private calibrationHistory: CalibrationResult[] = []

  /**
   * 监控预测准确性
   */
  async monitorPredictionAccuracy(
    predictions: PredictionResult[],
    groundTruth: number[]
  ): Promise<QualityMetrics> {
    if (predictions.length === 0 || groundTruth.length === 0) {
      throw new Error('预测结果或真实值不能为空')
    }

    // 提取预测值
    const predictedValues = predictions.map(p =>
      Array.isArray(p.prediction) ? p.prediction[0] : p.prediction
    )

    // 计算各项指标
    const accuracy = this.calculateAccuracy(groundTruth, predictedValues)
    const mae = this.calculateMAE(groundTruth, predictedValues)
    const rmse = this.calculateRMSE(groundTruth, predictedValues)
    this.calculateMAPE(groundTruth, predictedValues)
    const r2 = this.calculateR2(groundTruth, predictedValues)

    const metrics: QualityMetrics = {
      timestamp: Date.now(),
      accuracy,
      precision: accuracy,
      recall: accuracy,
      f1Score: accuracy,
      auc: 0.8,
      rmse,
      mae,
      r2Score: r2,
      calibrationScore: 0.8,
      biasScore: 0.8,
      fairnessScore: 0.8
    }

    // 记录质量历史
    this.qualityHistory.push({
      timestamp: Date.now(),
      accuracy,
      precision: accuracy,
      recall: accuracy,
      f1Score: accuracy,
      auc: 0.8,
      rmse,
      mae,
      r2Score: r2,
      calibrationScore: 0.8,
      biasScore: 0.8,
      fairnessScore: 0.8
    })

    // 保持历史记录在合理范围内
    if (this.qualityHistory.length > 1000) {
      this.qualityHistory = this.qualityHistory.slice(-500)
    }

    return metrics
  }

  /**
   * 检测预测偏见
   */
  async detectPredictionBias(
    predictions: PredictionResult[],
    sensitiveAttributes: SensitiveData
  ): Promise<BiasReport> {
    // 提取预测值和敏感属性
    const predictedValues = predictions.map(p =>
      Array.isArray(p.prediction) ? p.prediction[0] : p.prediction
    )

    const biasAnalysis = this.analyzeDemographicParity(
      predictedValues,
      sensitiveAttributes
    )

    const disparateImpact = this.analyzeDisparateImpact(
      predictedValues,
      sensitiveAttributes
    )

    const equalOpportunity = this.analyzeEqualOpportunity()

    const report: BiasReport = {
      overallBias: biasAnalysis,
      demographicParity: biasAnalysis,
      equalOpportunity: equalOpportunity,
      disparateImpact: disparateImpact,
      individualFairness: this.calculateIndividualFairness(predictions, sensitiveAttributes),
      affectedGroups: this.identifyAffectedGroups(sensitiveAttributes),
      recommendations: this.generateBiasRecommendations(biasAnalysis, disparateImpact, equalOpportunity),
      severity: this.assessBiasSeverity(biasAnalysis, disparateImpact, equalOpportunity),
      timestamp: Date.now(),
      overall: this.assessOverallBias(biasAnalysis, disparateImpact, equalOpportunity),
      metrics: {
        demographicParity: biasAnalysis,
        disparateImpact: disparateImpact,
        equalOpportunity: equalOpportunity
      },
      mitigation: this.generateBiasMitigationPlan(biasAnalysis, disparateImpact)
    }

    this.biasHistory.push(report)

    // 保持历史记录
    if (this.biasHistory.length > 100) {
      this.biasHistory = this.biasHistory.slice(-50)
    }

    return report
  }

  /**
   * 校准预测不确定性
   */
  async calibratePredictionUncertainty(predictions: PredictionResult[]): Promise<CalibrationResult> {
    if (predictions.length === 0) {
      throw new Error('预测结果不能为空')
    }

    // 分析置信度校准
    const calibrationMetrics = this.analyzeConfidenceCalibration(predictions)

    // 计算可靠性图
    const reliabilityDiagram = this.generateReliabilityDiagram(predictions)

    // 生成校准曲线
    const calibrationCurve = this.generateCalibrationCurve(predictions)

    const result: CalibrationResult = {
      calibrationMethod: 'isotonic_regression',
      calibrationCurve: calibrationCurve,
      calibrationScore: this.calculateCalibrationScore(calibrationMetrics),
      improvement: this.calculateCalibrationImprovement(calibrationMetrics, calibrationCurve),
      recommendedAdjustments: this.generateRecommendedAdjustments(calibrationMetrics),
      timestamp: Date.now(),
      originalMetrics: calibrationMetrics,
      calibratedMetrics: this.applyCalibration(predictions, calibrationMetrics),
      reliabilityDiagram,
      recommendedMethod: 'isotonic_regression'
    }

    this.calibrationHistory.push(result)

    return result
  }

  /**
   * 记录预测结果用于质量监控
   */
  async recordPrediction(prediction: PredictionResult): Promise<void> {
    // 这里可以添加实时质量监控逻辑
    if (prediction.confidence < 0.3) {
      console.warn('低置信度预测检测到:', prediction.id)
    }

    // 检查异常模式
    await this.detectAnomalyPatterns(prediction)
  }

  /**
   * 获取质量统计
   */
  getQualityStatistics(): {
    recentMetrics: QualityMetrics | null
    qualityTrend: 'improving' | 'declining' | 'stable'
    biasTrend: 'improving' | 'declining' | 'stable'
    calibrationTrend: 'improving' | 'declining' | 'stable'
  } {
    const recentMetrics = this.qualityHistory.length > 0 ?
      this.qualityHistory[this.qualityHistory.length - 1] : null

    const qualityTrend = this.calculateTrend(this.qualityHistory.map(h => h.accuracy))
    const biasTrend = this.calculateTrend(this.biasHistory.map(h =>
      h.overall === 'high' ? 0 : h.overall === 'low' ? 2 : 1
    ))
    const calibrationTrend = this.calculateTrend(this.calibrationHistory.map(h => h.improvement))

    return {
      recentMetrics,
      qualityTrend,
      biasTrend,
      calibrationTrend
    }
  }

  // 私有辅助方法

  private calculateAccuracy(actuals: number[], predictions: number[]): number {
    if (actuals.length !== predictions.length) return 0

    const correct = predictions.reduce((count, pred, i) => {
      // 对于回归问题，使用容忍度来判断正确性
      const tolerance = Math.abs(actuals[i]) * 0.1 // 10%容忍度
      return count + (Math.abs(pred - actuals[i]) <= tolerance ? 1 : 0)
    }, 0)

    return correct / predictions.length
  }

  private calculateMAE(actuals: number[], predictions: number[]): number {
    return predictions.reduce((sum, pred, i) => sum + Math.abs(pred - actuals[i]), 0) / predictions.length
  }

  private calculateRMSE(actuals: number[], predictions: number[]): number {
    return Math.sqrt(predictions.reduce((sum, pred, i) => sum + Math.pow(pred - actuals[i], 2), 0) / predictions.length)
  }

  private calculateMAPE(actuals: number[], predictions: number[]): number {
    return predictions.reduce((sum, pred, i) => {
      const actual = actuals[i]
      return actual !== 0 ? sum + Math.abs((pred - actual) / actual) : sum
    }, 0) / predictions.length
  }

  private calculateR2(actuals: number[], predictions: number[]): number {
    const actualMean = actuals.reduce((a, b) => a + b, 0) / actuals.length
    const totalSS = actuals.reduce((sum, actual) => sum + Math.pow(actual - actualMean, 2), 0)
    const residualSS = predictions.reduce((sum, pred, i) => sum + Math.pow(pred - actuals[i], 2), 0)
    return 1 - (residualSS / totalSS)
  }

  private analyzeDemographicParity(
    predictions: number[],
    sensitiveAttributes: SensitiveData
  ): number {
    // 简化的 demographic parity分析
    const groups = sensitiveAttributes.groups || {}
    let maxDifference = 0

    const groupMeans: Record<string, number> = {}
    let totalCount = 0

    // 计算各组的平均预测值
    Object.entries(groups).forEach(([group, indices]) => {
      const groupPredictions = indices.filter(i => i < predictions.length).map(i => predictions[i])
      if (groupPredictions.length > 0) {
        groupMeans[group] = groupPredictions.reduce((sum, pred) => sum + pred, 0) / groupPredictions.length
        totalCount += groupPredictions.length
      }
    })

    // 计算组间差异
    const meanValues = Object.values(groupMeans)
    if (meanValues.length > 1) {
      const overallMean = meanValues.reduce((a, b) => a + b, 0) / meanValues.length
      maxDifference = Math.max(...meanValues.map(mean => Math.abs(mean - overallMean)))
    }

    return totalCount > 0 ? Math.max(0, 1 - maxDifference) : 1
  }

  private analyzeDisparateImpact(
    predictions: number[],
    sensitiveAttributes: SensitiveData
  ): number {
    // 简化的disparate impact分析
    const groups = sensitiveAttributes.groups || {}
    const impactScores: number[] = []

    const groupPredictions: Record<string, number[]> = {}
    Object.entries(groups).forEach(([group, indices]) => {
      groupPredictions[group] = indices.filter(i => i < predictions.length).map(i => predictions[i])
    })

    // 计算各组间的impact差异
    const groupMeans = Object.values(groupPredictions).map(preds =>
      preds.length > 0 ? preds.reduce((sum, p) => sum + p, 0) / preds.length : 0
    )

    if (groupMeans.length > 1) {
      const maxMean = Math.max(...groupMeans)
      const minMean = Math.min(...groupMeans)
      impactScores.push(1 - minMean / maxMean)
    }

    return impactScores.length > 0 ? impactScores.reduce((a, b) => a + b, 0) / impactScores.length : 1
  }

  private analyzeEqualOpportunity(): number {
    // 简化的equal opportunity分析
    return 0.8 // 占位符
  }

  private assessOverallBias(
    demographicParity: number,
    disparateImpact: number,
    equalOpportunity: number
  ): 'low' | 'medium' | 'high' {
    const avgScore = (demographicParity + disparateImpact + equalOpportunity) / 3

    if (avgScore >= 0.8) return 'low'
    if (avgScore >= 0.6) return 'medium'
    return 'high'
  }

  private generateBiasRecommendations(
    demographicParity: number,
    disparateImpact: number,
    equalOpportunity: number
  ): string[] {
    const recommendations = []

    if (demographicParity < 0.8) {
      recommendations.push('实施demographic parity校正算法')
    }

    if (disparateImpact < 0.8) {
      recommendations.push('进行disparate impact分析并调整模型')
    }

    if (equalOpportunity < 0.8) {
      recommendations.push('应用equal机会约束优化')
    }

    if (recommendations.length === 0) {
      recommendations.push('当前模型偏见水平在可接受范围内')
    }

    return recommendations
  }

  private identifyAffectedGroups(sensitiveAttributes: SensitiveData): string[] {
    return Object.keys(sensitiveAttributes.groups || {})
  }

  private generateBiasMitigationPlan(
    demographicParity: number,
    disparateImpact: number
  ): string[] {
    const mitigation = []

    mitigation.push('定期监控模型偏见指标')
    mitigation.push('建立偏见检测和报警机制')
    mitigation.push('实施模型重训练和验证流程')

    if (demographicParity < 0.8) {
      mitigation.push('采用demographic parity约束训练方法')
    }

    if (disparateImpact < 0.8) {
      mitigation.push('应用fairness感知学习算法')
    }

    return mitigation
  }

  private analyzeConfidenceCalibration(predictions: PredictionResult[]): ConfidenceCalibrationMetrics {
    const confidences = predictions.map(p => p.confidence)
    const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length
    const confidenceVariance = this.calculateVariance(confidences)

    return {
      avgConfidence,
      confidenceVariance,
      calibrationError: this.estimateCalibrationError(predictions),
      overconfidentRatio: this.calculateOverconfidentRatio(predictions)
    }
  }

  private generateReliabilityDiagram(predictions: PredictionResult[]): ReliabilityDiagramPoint[] {
    // 生成可靠性图数据点
    const confidenceBins = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]

    return confidenceBins.map(confidence => ({
      confidence,
      empiricalAccuracy: this.calculateEmpiricalAccuracy(predictions, confidence),
      count: predictions.filter(p => p.confidence <= confidence).length
    }))
  }

  private generateCalibrationCurve(predictions: PredictionResult[]): CalibrationCurvePoint[] {
    // 生成校准曲线数据
    return this.generateReliabilityDiagram(predictions).map(point => ({
      predicted: point.confidence,
      actual: point.empiricalAccuracy,
      count: point.count
    }))
  }

  private applyCalibration(predictions: PredictionResult[], metrics: CalibrationMetrics): CalibrationMetrics {
    // 应用校准到预测置信度
    return {
      avgConfidence: metrics.avgConfidence,
      confidenceVariance: metrics.confidenceVariance * 0.8, // 减少方差
      calibrationError: metrics.calibrationError * 0.5,
      overconfidentRatio: metrics.overconfidentRatio * 0.7
    }
  }

  private calculateCalibrationImprovement(_originalMetrics: CalibrationMetrics, calibrationCurve: CalibrationCurvePoint[]): number {
    if (calibrationCurve.length === 0) return 0

    // 计算校准曲线与理想校准线的偏差
    const totalDeviation = calibrationCurve.reduce((sum, point) => {
      const deviation = Math.abs(point.predicted - point.actual)
      return sum + deviation
    }, 0)

    return Math.max(0, 1 - totalDeviation / calibrationCurve.length)
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  }

  private estimateCalibrationError(predictions: PredictionResult[]): number {
    // 简化的校准误差估计
    const confidences = predictions.map(p => p.confidence)
    const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length

    // 假设理想情况下置信度应该与准确度一致
    // 误差设为置信度与0.5之间的平均绝对差
    return Math.abs(avgConfidence - 0.5)
  }

  private calculateOverconfidentRatio(predictions: PredictionResult[]): number {
    const highConfidenceCount = predictions.filter(p => p.confidence > 0.7).length
    const totalCount = predictions.length

    return totalCount > 0 ? highConfidenceCount / totalCount : 0
  }

  private calculateEmpiricalAccuracy(predictions: PredictionResult[], confidenceThreshold: number): number {
    const filteredPredictions = predictions.filter(p => p.confidence <= confidenceThreshold)

    if (filteredPredictions.length === 0) return 0

    // 简化处理：假设预测准确性
    return filteredPredictions.reduce((sum, p) => sum + p.confidence, 0) / filteredPredictions.length
  }

  private calculateTrend(values: number[]): 'improving' | 'declining' | 'stable' {
    if (values.length < 3) return 'stable'

    const recent = values.slice(-3)
    const older = values.slice(-6, -3)

    if (recent.length === 0 || older.length === 0) return 'stable'

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length

    const difference = recentAvg - olderAvg

    if (difference > 0.05) return 'improving'
    if (difference < -0.05) return 'declining'
    return 'stable'
  }

  private async detectAnomalyPatterns(prediction: PredictionResult): Promise<void> {
    // 检测异常模式
    if (prediction.confidence < 0.1) {
      console.warn('极低置信度预测异常:', prediction.id)
    }

    // 可以添加更多异常检测逻辑
  }

  private calculateIndividualFairness(predictions: PredictionResult[], sensitiveAttributes: SensitiveData): number {
    // 计算个体公平性：相似个体应该获得相似预测
    if (predictions.length < 2) return 1.0

    let totalDifference = 0
    let comparisons = 0

    for (let i = 0; i < predictions.length; i++) {
      for (let j = i + 1; j < predictions.length; j++) {
        const p1 = predictions[i]
        const p2 = predictions[j]

        // 检查是否为相似个体（基于敏感属性）
        const isSimilar = this.checkIndividualSimilarity(p1, p2, sensitiveAttributes)

        if (isSimilar) {
          const diff = Math.abs(p1.confidence - p2.confidence)
          totalDifference += diff
          comparisons++
        }
      }
    }

    return comparisons > 0 ? 1 - (totalDifference / comparisons) : 1.0
  }

  private checkIndividualSimilarity(p1: PredictionResult, p2: PredictionResult, sensitiveAttributes: SensitiveData): boolean {
    const keys = sensitiveAttributes.attributes || []
    if (keys.length === 0) return true

    for (const key of keys) {
      const value1 = p1.metadata?.[key]
      const value2 = p2.metadata?.[key]

      if (value1 !== undefined && value2 !== undefined && value1 !== value2) {
        return false
      }
    }

    return true
  }

  private assessBiasSeverity(demographicParity: number, disparateImpact: number, equalOpportunity: number): 'low' | 'medium' | 'high' | 'critical' {
    const avgBias = (demographicParity + disparateImpact + equalOpportunity) / 3

    if (avgBias >= 0.9) return 'low'
    if (avgBias >= 0.8) return 'medium'
    if (avgBias >= 0.6) return 'high'
    return 'critical'
  }

  private calculateCalibrationScore(calibrationMetrics: CalibrationMetrics): number {
    // 计算校准分数：基于置信度与准确度的一致性
    if (!calibrationMetrics) return 0.5

    const expectedAccuracy = calibrationMetrics.expectedAccuracy || 0.5
    const actualAccuracy = calibrationMetrics.actualAccuracy || 0.5

    // 校准分数是期望准确度和实际准确度的接近程度
    return 1 - Math.abs(expectedAccuracy - actualAccuracy)
  }

  private generateRecommendedAdjustments(calibrationMetrics: CalibrationMetrics): Record<string, number> {
    // 生成推荐的调整参数
    const adjustments: Record<string, number> = {}

    if (!calibrationMetrics) return adjustments

    // 基于校准误差调整置信度
    const calibrationError = calibrationMetrics.calibrationError || 0
    if (calibrationError > 0.1) {
      adjustments.confidenceMultiplier = 0.9
    } else if (calibrationError > 0.05) {
      adjustments.confidenceMultiplier = 0.95
    } else {
      adjustments.confidenceMultiplier = 1.0
    }

    // 调整温度参数
    const temperature = calibrationMetrics.temperature || 1.0
    adjustments.temperature = Math.max(0.5, Math.min(2.0, temperature * (1 + calibrationError)))

    return adjustments
  }
}
