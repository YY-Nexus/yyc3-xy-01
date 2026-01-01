/**
 * @file common.ts
 * @description YYC³ AI小语智能成长守护系统元学习系统类型定义，定义多层次学习、自适应能力和学习策略的类型
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

/**
 * 学习级别
 */
export type LearningLevel = 'behavioral' | 'strategic' | 'knowledge'

/**
 * 学习配置
 */
export interface LearningConfig {
  levels?: LearningLevel[]
  adaptationRate?: number
  experienceBufferSize?: number
  learningRate?: number
  explorationRate?: number
  transferThreshold?: number
  curriculumStages?: number
  ensembleSize?: number
  updateFrequency?: number
  persistLearning?: boolean
  enableTransfer?: boolean
  enableCurriculum?: boolean
  enableEnsemble?: boolean
}

/**
 * 学习经验
 */
export interface LearningExperience {
  id: string
  taskType: string
  context: Record<string, unknown>
  action: string
  outcome: unknown
  reward: number
  timestamp: Date
  processed: boolean
  metadata?: Record<string, unknown>
  tags?: string[]
  complexity?: number
  success?: boolean
  duration?: number
}

/**
 * 学习策略
 */
export interface LearningStrategy {
  id: string
  name: string
  description: string
  taskType: string
  level: LearningLevel
  algorithm: string
  parameters: Record<string, unknown>
  performance: number
  confidence: number
  lastUsed: Date
  usageCount: number
  successRate: number
  adaptationHistory: Array<{
    timestamp: Date
    changes: Record<string, unknown>
    reason: string
  }>
  metaParameters: {
    learningRate: number
    explorationRate: number
    discountFactor: number
    batchSize?: number
  }
}

/**
 * 元学习者
 */
export interface MetaLearner {
  id: string
  level: LearningLevel
  strategies: string[]
  performance: number
  adaptationRate: number
  lastUpdate: Date
  learningHistory: Array<{
    timestamp: Date
    experience: string
    strategy: string
    outcome: unknown
    improvement: number
  }>
  metaKnowledge: Record<string, unknown>
  capabilities: string[]
}

/**
 * 学习指标
 */
export interface LearningMetrics {
  totalExperiences: number
  strategiesLearned: number
  adaptationsPerformed: number
  transferLearningSuccess: number
  averageLearningRate: number
  knowledgeGraphNodes: number
  knowledgeGraphEdges: number
  lastUpdated: Date
  performanceMetrics: Map<string, number>
  learningEfficiency: number
  convergenceRate?: number
  generalizationAbility?: number
}

/**
 * 知识图谱
 */
export interface KnowledgeGraph {
  nodes: Map<string, KnowledgeNode>
  edges: Map<string, KnowledgeEdge>
  embeddings?: Map<string, number[]>
  clusters?: Map<string, string[]>
  metadata: {
    nodeCount: number
    edgeCount: number
    lastUpdated: Date
    version: string
  }
}

/**
 * 知识节点
 */
export interface KnowledgeNode {
  id: string
  type: 'concept' | 'skill' | 'strategy' | 'experience' | 'pattern'
  label: string
  description: string
  attributes: Record<string, unknown>
  confidence: number
  frequency: number
  lastAccessed: Date
  relatedNodes: string[]
  embeddings?: number[]
  metadata?: Record<string, unknown>
}

/**
 * 知识边
 */
export interface KnowledgeEdge {
  id: string
  source: string
  target: string
  type: 'causal' | 'correlational' | 'hierarchical' | 'sequential' | 'similarity'
  weight: number
  strength: number
  direction: 'directed' | 'undirected'
  metadata?: Record<string, unknown>
}

/**
 * 经验回放
 */
export interface ExperienceReplay {
  experiences: LearningExperience[]
  bufferSize: number
  currentSize: number
  lastUpdated: Date
  priorityScores: Map<string, number>
  samplingStrategy: 'uniform' | 'prioritized' | 'ranked' | 'stochastic'
  importanceWeights: Map<string, number>
}

/**
 * 适应策略
 */
export interface AdaptationStrategy {
  id: string
  name: string
  description: string
  needs: string[]
  actions: AdaptationAction[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedImpact: number
  complexity: number
  resources: Array<{
    type: string
    quantity: number
    cost?: number
  }>
  timeline: {
    estimated: number
    actual?: number
  }
  success?: boolean
  effectiveness?: number
}

/**
 * 适应行动
 */
export interface AdaptationAction {
  id: string
  type: 'parameter_adjustment' | 'strategy_update' | 'model_retrain' | 'knowledge_update'
  target: string
  parameters: Record<string, unknown>
  expectedOutcome: string
  dependencies?: string[]
  risk?: number
}

/**
 * 学习反馈
 */
export interface LearningFeedback {
  taskId: string
  action: string
  outcome: unknown
  timestamp: Date
  immediateReward: number
  longTermValue: number
  analysis: {
    success: boolean
    efficiency: number
    quality: number
    novelty: number
    difficulty: number
  }
  improvements: string[]
  confidence: number
  recommendations: string[]
  contextualFactors: Record<string, unknown>
}

/**
 * 模型集成
 */
export interface ModelEnsemble {
  id: string
  models: Array<{
    id: string
    type: string
    performance: number
    weight: number
    contribution?: number
  }>
  strategy: EnsembleStrategy
  weights: number[]
  performance: EnsemblePerformance
  diversity: ModelDiversity
  taskType: string
  createdAt: Date
  lastUpdated: Date
  metadata?: Record<string, unknown>
}

/**
 * 集成策略
 */
export type EnsembleStrategy =
  | 'weighted_average'
  | 'majority_voting'
  | 'stacking'
  | 'boosting'
  | 'bagging'
  | 'dynamic_selection'
  | 'adaptive_weighting'

/**
 * 集成性能
 */
export interface EnsemblePerformance {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  improvement: number
  robustness: number
  stability: number
  generalization: number
  trainingTime: number
  inferenceTime: number
}

/**
 * 模型多样性
 */
export interface ModelDiversity {
  diversity: number
  correlations: Array<{
    modelA: string
    modelB: string
    correlation: number
  }>
  complementarity: number
  redundancy: number
  coverage: number
}

/**
 * 迁移学习
 */
export interface TransferLearning {
  id: string
  sourceDomain: string
  targetDomain: string
  domainSimilarity: {
    score: number
    sharedFeatures: string[]
    differences: string[]
    confidence: number
  }
  transferableKnowledge: {
    knowledge: unknown[]
    confidence: number
    adaptability: number
  }
  transferredKnowledge: unknown
  validationResults: {
    successRate: number
    improvementRate: number
    transferEfficiency: number
    adaptationCost: number
  }
  success: boolean
  improvementRate: number
  timestamp: Date
  transferMethod: 'fine_tuning' | 'feature_extraction' | 'domain_adaptation' | 'multi_task'
}

/**
 * 课程学习
 */
export interface CurriculumLearning {
  id: string
  objectives: string[]
  sequence: CurriculumStage[]
  progress: Record<string, number>
  evaluation: CurriculumEvaluation
  completionTime: number
  success: boolean
  difficulty: 'linear' | 'adaptive' | 'self_paced'
}

/**
 * 课程阶段
 */
export interface CurriculumStage {
  level: number
  objective: string
  description: string
  prerequisites: string[]
  learningOutcomes: string[]
  requiredMastery: number
  assessmentCriteria: string[]
  resources: CurriculumResource[]
  duration: number
  difficulty: number
}

/**
 * 课程资源
 */
export interface CurriculumResource {
  type: 'text' | 'video' | 'exercise' | 'project' | 'simulation'
  title: string
  description: string
  url?: string
  content?: string
  difficulty: number
  estimatedTime: number
  prerequisites?: string[]
  learningObjectives: string[]
}

/**
 * 课程评估
 */
export interface CurriculumEvaluation {
  overallMastery: number
  stageResults: Record<string, {
    mastery: number
    timeSpent: number
    attempts: number
    feedback: string
  }>
  learningEfficiency: number
  retentionRate: number
  transferability: number
  engagement: number
  recommendations: string[]
}

/**
 * 模式识别
 */
export interface PatternRecognition {
  patterns: LearningPattern[]
  clusters: PatternCluster[]
  anomalies: PatternAnomaly[]
  trends: PatternTrend[]
  confidence: number
}

/**
 * 学习模式
 */
export interface LearningPattern {
  id: string
  name: string
  description: string
  category: 'behavioral' | 'strategic' | 'knowledge'
  frequency: number
  strength: number
  predictability: number
  context: Record<string, unknown>
  outcomes: Array<{
    action: string
    result: unknown
    probability: number
  }>
  confidence: number
  lastObserved: Date
}

/**
 * 模式聚类
 */
export interface PatternCluster {
  id: string
  center: number[]
  members: string[]
  cohesion: number
  separation: number
  label: string
  description: string
  characteristics: Record<string, unknown>
}

/**
 * 模式异常
 */
export interface PatternAnomaly {
  id: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  pattern: string
  deviation: number
  context: Record<string, unknown>
  detectedAt: Date
  resolved?: boolean
}

/**
 * 模式趋势
 */
export interface PatternTrend {
  metric: string
  direction: 'increasing' | 'decreasing' | 'stable' | 'oscillating'
  slope: number
  confidence: number
  period: number
  seasonality?: number
  forecast: Array<{
    timestamp: Date
    value: number
    confidence: number
  }>
}

/**
 * 强化学习组件
 */
export interface ReinforcementLearning {
  agent: RLAgent
  environment: RLEnvironment
  policy: RLPolicy
  valueFunction: RLValueFunction
  experienceReplay: RLExperienceReplay
  exploration: RLExploration
}

/**
 * 强化学习代理
 */
export interface RLAgent {
  id: string
  type: 'q_learning' | 'policy_gradient' | 'actor_critic' | 'ddpg' | 'sac'
  state: RLState
  action: RLAction
  reward: number
  done: boolean
  episode: number
  step: number
  totalReward: number
  performance: number
}

/**
 * 强化学习状态
 */
export interface RLState {
  features: number[]
  discrete?: string[]
  continuous?: number[]
  context?: Record<string, unknown>
  timestamp: Date
  terminal: boolean
}

/**
 * 强化学习动作
 */
export interface RLAction {
  type: 'discrete' | 'continuous' | 'mixed'
  value: unknown
  probability?: number
  qValue?: number
  confidence?: number
}

/**
 * 强化学习环境
 */
export interface RLEnvironment {
  id: string
  stateSpace: RLStateSpace
  actionSpace: RLActionSpace
  dynamics: Record<string, unknown>
  transitionFunction: (state: RLState, action: RLAction) => RLState
  rewardFunction: (state: RLState, action: RLAction, nextState: RLState) => number
  doneFunction: (state: RLState) => boolean
  resetFunction: () => RLState
}

/**
 * 强化学习状态空间
 */
export interface RLStateSpace {
  type: 'discrete' | 'continuous' | 'mixed'
  dimensions: number
  bounds?: Array<[number, number]>
  shape?: number[]
  dtype?: string
}

/**
 * 强化学习动作空间
 */
export interface RLActionSpace {
  type: 'discrete' | 'continuous' | 'mixed'
  dimensions: number
  bounds?: Array<[number, number]>
  actions?: unknown[]
  dtype?: string
}

/**
 * 强化学习策略
 */
export interface RLPolicy {
  id: string
  type: 'stochastic' | 'deterministic' | 'epsilon_greedy'
  parameters: Record<string, unknown>
  network?: unknown
  weights?: number[]
  performance: number
  convergence: boolean
  lastUpdate: Date
}

/**
 * 强化学习价值函数
 */
export interface RLValueFunction {
  type: 'state_value' | 'action_value' | 'advantage'
  parameters: Record<string, unknown>
  network?: unknown
  weights?: number[]
  learningRate: number
  discountFactor: number
  target: number[]
  predictions: number[]
  errors: number[]
}

/**
 * 强化学习经验回放
 */
export interface RLExperienceReplay {
  capacity: number
  experiences: RLExperience[]
  priorities: number[]
  samplingStrategy: 'uniform' | 'prioritized' | 'ranked'
  beta: number
  alpha: number
}

/**
 * 强化学习经验
 */
export interface RLExperience {
  state: RLState
  action: RLAction
  reward: number
  nextState: RLState
  done: boolean
  priority?: number
  tdError?: number
}

/**
 * 强化学习探索
 */
export interface RLExploration {
  strategy: 'epsilon_greedy' | 'boltzmann' | 'ucb' | 'thompson_sampling'
  parameters: Record<string, unknown>
  explorationRate: number
  decayRate: number
  minExplorationRate: number
  totalSteps: number
}

/**
 * 自适应学习
 */
export interface AdaptiveLearning {
  adaptability: number
  plasticity: number
  stability: number
  forgettingRate: number
  consolidationRate: number
  transferAbility: number
  generalization: number
  robustness: number
  efficiency: number
  lastAdaptation: Date
  adaptationHistory: Array<{
    timestamp: Date
    trigger: string
    adaptation: string
    effectiveness: number
  }>
}

/**
 * 学习上下文
 */
export interface LearningContext {
  taskType: string
  environment: Record<string, string | number | boolean>
  state: Record<string, string | number | boolean>
  metadata?: Record<string, string | number | boolean>
  timestamp?: Date
}

/**
 * 环境特征
 */
export interface EnvironmentFeatures {
  complexity: number
  dynamism: number
  uncertainty: number
  constraints: string[]
  resources: Array<{
    type: string
    availability: number
    quality: number
  }>
  metrics: Record<string, number>
  timestamp: Date
}

/**
 * 环境差异分析
 */
export interface EnvironmentDifference {
  score: number
  differences: Array<{
    feature: string
    previousValue: string | number | boolean
    currentValue: string | number | boolean
    impact: 'low' | 'medium' | 'high'
  }>
  addedFeatures: string[]
  removedFeatures: string[]
  changedFeatures: string[]
  timestamp: Date
}

/**
 * 迁移数据
 */
export interface TransferData {
  sourceDomain: string
  knowledgeBase: Array<{
    id: string
    type: string
    content: string | number | boolean | object
    confidence: number
    transferability: number
  }>
  patterns: Array<{
    name: string
    frequency: number
    strength: number
  }>
  statistics: Record<string, number>
  metadata?: Record<string, string | number | boolean>
}

/**
 * 学习结果
 */
export interface LearningOutcome {
  success: boolean
  efficiency: number
  quality: number
  novelty: number
  difficulty: number
  timeSpent: number
  resourcesUsed: Array<{
    type: string
    quantity: number
    cost?: number
  }>
  errors: Array<{
    type: string
    message: string
    severity: 'low' | 'medium' | 'high'
  }>
  warnings: string[]
  metadata?: Record<string, string | number | boolean>
}

/**
 * 学习模式分析
 */
export interface PatternAnalysis {
  patterns: Array<{
    id: string
    name: string
    description: string
    frequency: number
    strength: number
    confidence: number
  }>
  clusters: Array<{
    id: string
    label: string
    size: number
    cohesion: number
  }>
  trends: Array<{
    metric: string
    direction: 'increasing' | 'decreasing' | 'stable'
    slope: number
  }>
  anomalies: Array<{
    id: string
    description: string
    severity: 'low' | 'medium' | 'high'
  }>
  confidence: number
  timestamp: Date
}

/**
 * 策略候选
 */
export interface StrategyCandidate {
  id: string
  name: string
  description: string
  algorithm: string
  parameters: Record<string, string | number | boolean>
  expectedPerformance: number
  complexity: number
  requirements: string[]
  estimatedCost?: number
  confidence: number
}

/**
 * 策略评估
 */
export interface StrategyEvaluation {
  id: string
  strategyId: string
  performance: number
  confidence: number
  robustness: number
  efficiency: number
  adaptability: number
  cost: number
  risk: number
  suitability: number
  timestamp: Date
}

/**
 * 优化策略
 */
export interface OptimizedStrategy {
  id: string
  originalId: string
  name: string
  description: string
  algorithm: string
  parameters: Record<string, string | number | boolean>
  performance: number
  confidence: number
  optimizations: Array<{
    type: string
    description: string
    improvement: number
  }>
  timestamp: Date
}

/**
 * 适应验证结果
 */
export interface AdaptationValidation {
  successRate: number
  improvement: number
  stability: number
  convergence: boolean
  adaptationTime: number
  resourceUsage: Record<string, number>
  sideEffects: string[]
  recommendations: string[]
  timestamp: Date
}

/**
 * 元学习者更新结果
 */
export interface MetaLearnerUpdate {
  learnerId: string
  performance: number
  adaptationRate: number
  knowledgeGain: number
  strategyUpdates: Array<{
    strategyId: string
    change: string
    reason: string
  }>
  timestamp: Date
}

/**
 * 可迁移知识
 */
export interface TransferableKnowledge {
  knowledge: Array<{
    id: string
    type: string
    content: string | number | boolean | object
    confidence: number
    transferability: number
    domain: string
  }>
  confidence: number
  adaptability: number
  completeness: number
  relevance: number
}

/**
 * 迁移的知识
 */
export interface TransferredKnowledge {
  sourceKnowledge: TransferableKnowledge
  targetDomain: string
  transferredItems: Array<{
    originalId: string
    newId: string
    adaptation: 'none' | 'light' | 'heavy'
    confidence: number
  }>
  adaptationMethod: string
  timestamp: Date
}

/**
 * 课程学习材料
 */
export interface LearningMaterials {
  materials: Array<{
    id: string
    type: 'text' | 'video' | 'exercise' | 'project' | 'simulation'
    title: string
    content: string
    difficulty: number
    estimatedTime: number
  }>
  difficulty: number
  objectives: string[]
  prerequisites: string[]
  timestamp: Date
}

/**
 * 学习阶段结果
 */
export interface LearningStageResult {
  results: Array<{
    taskId: string
    success: boolean
    score: number
    timeSpent: number
  }>
  timeSpent: number
  completionRate: number
  averageScore: number
  timestamp: Date
}

/**
 * 学习阶段评估
 */
export interface LearningStageEvaluation {
  mastery: number
  feedback: string
  improvements: string[]
  nextSteps: string[]
  confidence: number
  timestamp: Date
}

/**
 * 课程学习评估
 */
export interface CurriculumLearningEvaluation {
  overallMastery: number
  stageResults: Record<string, {
    mastery: number
    timeSpent: number
    attempts: number
    feedback: string
  }>
  learningEfficiency: number
  retentionRate: number
  transferability: number
  engagement: number
  recommendations: string[]
  timestamp: Date
}

/**
 * 模型多样性评估
 */
export interface ModelDiversityAssessment {
  diversity: number
  correlations: Array<{
    modelA: string
    modelB: string
    correlation: number
  }>
  complementarity: number
  redundancy: number
  coverage: number
  timestamp: Date
}

/**
 * 集成模型
 */
export interface EnsembleModel {
  weights: number[]
  strategy: string
  performance: {
    accuracy: number
    improvement: number
    robustness: number
  }
  metadata?: Record<string, string | number | boolean>
  timestamp: Date
}

/**
 * 优化后的集成模型
 */
export interface OptimizedEnsembleModel {
  weights: number[]
  strategy: string
  performance: {
    accuracy: number
    improvement: number
    robustness: number
  }
  optimizations: Array<{
    type: string
    description: string
    improvement: number
  }>
  timestamp: Date
}

/**
 * 集成性能验证
 */
export interface EnsemblePerformanceValidation {
  improvement: number
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  robustness: number
  stability: number
  trainingTime: number
  inferenceTime: number
  timestamp: Date
}

/**
 * 行动结果分析
 */
export interface ActionOutcomeAnalysis {
  success: boolean
  efficiency: number
  quality: number
  novelty: number
  difficulty: number
  timeTaken: number
  resourcesUsed: Record<string, number>
  errors: string[]
  warnings: string[]
  timestamp: Date
}

/**
 * 即时奖励计算
 */
export interface ImmediateReward {
  value: number
  factors: Array<{
    name: string
    weight: number
    value: number
  }>
  confidence: number
  timestamp: Date
}

/**
 * 长期价值评估
 */
export interface LongTermValue {
  value: number
  factors: Array<{
    name: string
    impact: number
    probability: number
  }>
  confidence: number
  timeHorizon: number
  timestamp: Date
}

/**
 * 改进建议
 */
export interface ImprovementSuggestion {
  category: string
  description: string
  priority: 'low' | 'medium' | 'high'
  expectedImpact: number
  effort: number
  dependencies?: string[]
}

/**
 * 反馈分析
 */
export interface FeedbackAnalysis {
  success: boolean
  efficiency: number
  quality: number
  novelty: number
  difficulty: number
  confidence: number
  timestamp: Date
}

/**
 * 行动推荐
 */
export interface ActionRecommendation {
  action: string
  reason: string
  expectedOutcome: string
  confidence: number
  priority: 'low' | 'medium' | 'high'
  estimatedEffort: number
}

/**
 * 知识节点数据
 */
export interface KnowledgeNodeData {
  id: string
  type: string
  label: string
  description: string
  attributes: Record<string, string | number | boolean>
  confidence: number
  frequency: number
  timestamp: Date
}

/**
 * 知识边数据
 */
export interface KnowledgeEdgeData {
  id: string
  type: string
  weight: number
  strength: number
  attributes?: Record<string, string | number | boolean>
  timestamp: Date
}

/**
 * 相关节点路径
 */
export interface NodePath {
  nodes: string[]
  edges: string[]
  length: number
  weight: number
  timestamp: Date
}