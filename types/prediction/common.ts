/**
 * @file common.ts
 * @description YYC³ AI小语智能成长守护系统智能预测系统通用类型定义，定义数据点、预测模型和评估指标的数据结构
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

// 基础数据结构
export interface DataPoint {
  timestamp: number
  value: number
  features?: Record<string, number>
  metadata?: Record<string, unknown>
}

export interface PredictionData {
  data: DataPoint[]
  target: string
  features?: string[]
  dataType: 'timeseries' | 'cross_sectional' | 'panel'
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'realtime'
}

// 预测器配置
export interface PredictorConfig {
  name: string
  algorithm: string
  parameters: Record<string, unknown>
  preprocessing?: {
    scaling?: boolean
    imputation?: string
    featureSelection?: boolean
    normalize?: boolean
    handleMissing?: 'interpolate' | 'mean' | 'median' | 'drop'
    featureEngineering?: boolean
    outlierRemoval?: boolean
  }
  validation?: {
    method: 'train_test_split' | 'cross_validation' | 'time_series_split'
    testSize?: number
    cvFolds?: number
  }
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  constraints?: ModelConstraints
  requirements?: TaskRequirements
}

// 训练结果
export interface TrainingResult {
  modelId: string
  algorithm: string
  parameters: Record<string, unknown>
  trainingTime: number
  trainingScore: number
  validationScore: number
  featureImportance?: Record<string, number>
  trainingMetrics: Record<string, number>
  timestamp: number
}

// 预测结果
export interface PredictionResult {
  id: string
  prediction: number | number[]
  confidence: number
  timestamp: number
  horizon: number
  modelId: string
  methodology: string
  confidenceInterval?: {
    lower: number | number[]
    upper: number | number[]
  }
  features?: Record<string, number>
  explanation?: string
  metadata?: Record<string, unknown>
}

// 特征集
export interface FeatureSet {
  features: string[]
  importance: Record<string, number>
  selectedFeatures: string[]
  engineeredFeatures: Record<string, number>
  statistics: Record<string, FeatureStatistics>
}

export interface FeatureStatistics {
  mean: number
  std: number
  min: number
  max: number
  missing: number
  type: 'numeric' | 'categorical' | 'datetime'
}

// 超参数优化
export interface OptimizedParams {
  parameters: Record<string, unknown>
  score: number
  optimizationTime: number
  searchSpace: Record<string, unknown>
  bestIteration: number
}

// 预测任务类型
export interface PredictionTask {
  id: string
  name: string
  type: 'regression' | 'classification' | 'forecasting' | 'anomaly_detection'
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  constraints?: ModelConstraints
  requirements?: TaskRequirements
}

export interface ModelConstraints {
  maxTrainingTime?: number
  maxPredictionTime?: number
  memoryLimit?: number
  accuracyThreshold?: number
  interpretabilityRequired?: boolean
  updateFrequency?: 'realtime' | 'batch' | 'scheduled'
  realTimeCapability?: boolean
  maxModels?: number
}

export interface TaskRequirements {
  features: string[]
  horizon?: number
  confidenceLevel?: number
  explanationRequired?: boolean
  realTimeCapability?: boolean
  uncertaintyQuantification?: boolean
  accuracy?: 'high' | 'medium' | 'low'
  speed?: 'high' | 'medium' | 'low'
  interpretability?: 'high' | 'medium' | 'low'
  scalability?: 'high' | 'medium' | 'low'
}

// 模型选择
export interface ModelSelection {
  selectedModel: string
  alternativeModels: string[]
  selectionReason: string
  expectedPerformance: number
  confidence: number
  fittingTime: number
}

export interface ModelFitAssessment {
  modelId: string
  goodnessOfFit: number
  residualAnalysis: ResidualAnalysis
  stabilityMetrics: StabilityMetrics
  biasVarianceTradeoff: BiasVarianceAnalysis
  recommendations: string[]
}

export interface ResidualAnalysis {
  meanError: number
  stdError: number
  skewness: number
  kurtosis: number
  autocorrelation: number
  heteroscedasticity: boolean
}

export interface StabilityMetrics {
  parameterStability: number
  predictionStability: number
  temporalStability: number
  sensitivity: Record<string, number>
}

export interface BiasVarianceAnalysis {
  bias: number
  variance: number
  irreducibleError: number
  totalError: number
  decomposition: 'bias2' | 'variance' | 'noise'
}

// 性能历史
export interface PerformanceHistory {
  timestamp: number
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  auc: number
  latency: number
  throughput: number
  errorRate: number
}

// 数据漂移
export interface DataDriftMetrics {
  featureDrift: Record<string, number>
  distributionShift: DistributionShift
  conceptDrift: ConceptDrift
  driftDetectionTime: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface DistributionShift {
  kolmogorovSmirnov: number
  wasserstein: number
  hellinger: number
  jensenShannon: number
}

export interface ConceptDrift {
  accuracyDecline: number
  errorPatternChange: number
  featureImportanceChange: Record<string, number>
  predictionDistributionChange: number
}

// 集成权重
export interface UpdatedWeights {
  weights: Record<string, number>
  adaptationReason: string
  performanceGain: number
  timestamp: number
}

// 概念漂移检测
export interface DriftDetection {
  detected: boolean
  driftType: 'sudden' | 'gradual' | 'incremental' | 'recurring'
  driftMagnitude: number
  pValue: number
  detectionMethod: string
  confidenceInterval: number[]
}

// 数据流
export interface DataStream {
  id: string
  data: DataPoint[]
  isRealTime: boolean
  updateFrequency: number
  bufferSize: number
  qualityMetrics: StreamQualityMetrics
}

export interface StreamQualityMetrics {
  completeness: number
  accuracy: number
  timeliness: number
  consistency: number
  validity: number
}

// 流式预测
export interface StreamingPrediction {
  timestamp: number
  prediction: number
  confidence: number
  processingTime: number
  dataQuality: StreamQualityMetrics
  modelVersion: string
  anomalies?: AnomalyReport[]
}

// 预测洞察
export interface PredictionInsights {
  summary: string
  keyPoints: InsightPoint[]
  performanceMetrics: PerformanceMetrics
  driftAlerts: DriftAlert[]
  recommendations: Recommendation[]
  riskAssessment: RiskAssessment
  confidence: number
}

export interface InsightPoint {
  type: 'trend' | 'pattern' | 'anomaly' | 'opportunity' | 'risk'
  description: string
  severity: 'low' | 'medium' | 'high'
  confidence: number
  actionability: 'immediate' | 'short_term' | 'long_term' | 'monitor'
}

export interface PerformanceMetrics {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  rmse: number
  mae: number
  r2Score: number
  customMetrics?: Record<string, number>
}

export interface DriftAlert {
  type: 'data' | 'concept' | 'performance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedFeatures: string[]
  recommendedAction: string
  timestamp: number
}

export interface Recommendation {
  category: 'model_update' | 'data_refresh' | 'parameter_tuning' | 'feature_engineering'
  priority: 'low' | 'medium' | 'high'
  description: string
  expectedImpact: string
  effort: 'low' | 'medium' | 'high'
}

export interface RiskAssessment {
  overall: 'low' | 'medium' | 'high'
  factors: RiskFactor[]
  mitigation: string[]
  monitoringRequired: string[]
}

export interface RiskFactor {
  type: 'data_quality' | 'model_drift' | 'overfitting' | 'underfitting' | 'bias'
  severity: 'low' | 'medium' | 'high'
  description: string
  impact: string
}

// 异常报告
export interface AnomalyReport {
  id: string
  type: 'statistical' | 'contextual' | 'collective' | 'temporal'
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: number
  value: number
  expectedRange: {
    min: number
    max: number
  }
  confidence: number
  description: string
  affectedFeatures?: string[]
  suggestedActions?: string[]
}

// 预测配置（别名，用于向后兼容）
export type PredictionConfig = PredictorConfig

// 质量指标
export interface QualityMetrics {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  auc: number
  rmse: number
  mae: number
  r2Score: number
  calibrationScore: number
  biasScore: number
  fairnessScore: number
  timestamp: number
}

// 偏差报告
export interface BiasReport {
  overallBias: number
  demographicParity: number
  equalOpportunity: number
  disparateImpact: number
  individualFairness: number
  affectedGroups: string[]
  recommendations: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: number
  overall?: 'low' | 'medium' | 'high'
  metrics?: {
    demographicParity: number
    disparateImpact: number
    equalOpportunity: number
  }
  mitigation?: string[]
}

// 校准结果
export interface CalibrationResult {
  calibrationMethod: string
  calibrationCurve: Array<{ predicted: number; actual: number }>
  calibrationScore: number
  improvement: number
  recommendedAdjustments: Record<string, number>
  timestamp: number
  originalMetrics?: QualityMetrics
  calibratedMetrics?: QualityMetrics
  reliabilityDiagram?: Array<{ predicted: number; actual: number; frequency: number }>
  recommendedMethod?: string
}

// 敏感数据
export interface SensitiveData {
  attributes: string[]
  protectedGroups: Record<string, string[]>
  dataCategories: string[]
  privacyLevel: 'public' | 'sensitive' | 'confidential' | 'restricted'
  consentStatus: string[]
  groups?: Record<string, number[]>
}

// 基础模型接口
export interface BaseModel {
  id: string
  name: string
  type: 'regression' | 'classification' | 'forecasting' | 'anomaly_detection'
  version: string
  createdAt: number
  updatedAt: number
  metadata?: Record<string, unknown>
}

// 任务状态
export interface TaskStatus {
  taskId: string
  modelInfo: ModelInfo
  config: PredictorConfig
  createdAt: number
  lastUpdated?: number
  predictionCount: number
}

// 预测器接口
export interface Predictor {
  train(data: PredictionData): Promise<void>
  predict(data: PredictionData, horizon?: number): Promise<PredictionResult>
  getModelInfo(): ModelInfo
}

// 模型信息
export interface ModelInfo {
  modelId: string
  name: string
  algorithm: string
  version?: string
  createdAt?: number
  metadata?: Record<string, unknown>
}

// 性能分析结果
export interface PerformanceAnalysis {
  accuracy: number
  confidence: number
  stability: number
  avgLatency: number
  predictionCount: number
}

// 任务预测器信息
export interface TaskPredictorInfo {
  ensemble: EnsembleEngine
  predictor?: Predictor
  config: PredictorConfig
  data: PredictionData
  modelSelection: ModelSelection
  createdAt: number
  lastUpdated?: number
}

// 集成引擎接口
export interface EnsembleEngine {
  train(data: PredictionData): Promise<void>
  predict(data: PredictionData, horizon?: number): Promise<PredictionResult>
  addPredictor(predictor: Predictor): void
  getModelInfo(): ModelInfo
  detectConceptDrift?(data: PredictionData): Promise<DriftDetection | undefined>
}

// 风险评估
export interface RiskAssessment {
  overall: 'low' | 'medium' | 'high'
  factors: RiskFactor[]
  mitigation: string[]
  monitoring: string[]
}

// 洞察点
export interface InsightPoint {
  type: 'trend' | 'pattern' | 'anomaly' | 'opportunity' | 'risk'
  description: string
  severity: 'low' | 'medium' | 'high'
  confidence: number
  actionability: 'immediate' | 'short_term' | 'long_term' | 'monitor'
}