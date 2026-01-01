/**
 * @file IntelligentConfigPanel.tsx
 * @description YYC³ AI小语智能成长守护系统智能配置面板组件，提供模型参数配置、工作流构建和自动化设置功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'

import { Zap, Brain, AlertTriangle, CheckCircle } from 'lucide-react'

import type {
  PredictionConfig,
  PredictionTask,
  ModelConstraints
} from '@/types/prediction/common'

interface IntelligentConfigPanelProps {
  onConfigChange?: (config: PredictionConfig) => void
  onTaskCreate?: (task: PredictionTask) => Promise<void>
  onValidateConfig?: (config: PredictionConfig) => Promise<boolean>
  availableModels?: string[]
  currentConfig?: PredictionConfig
  isProcessing?: boolean
}

interface ModelTemplate {
  id: string
  name: string
  description: string
  category: 'forecasting' | 'anomaly_detection' | 'classification' | 'regression'
  parameters: Record<string, unknown>
  constraints: ModelConstraints
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedAccuracy: number
  trainingTime: number
  icon: React.ReactNode
}

const IntelligentConfigPanel: React.FC<IntelligentConfigPanelProps> = ({
  onConfigChange,
  onTaskCreate,
  onValidateConfig,
  availableModels = [],
  currentConfig,
  isProcessing = false
}) => {
  const [config, setConfig] = useState<PredictionConfig>({
    name: '',
    algorithm: 'adaptive_ensemble',
    parameters: {},
    preprocessing: {
      normalize: true,
      handleMissing: 'interpolate',
      featureEngineering: true,
      outlierRemoval: true
    },
    validation: {
      method: 'cross_validation',
      cvFolds: 5,
      testSize: 0.2
    },
    constraints: {
      maxTrainingTime: 300000,
      memoryLimit: 1024,
      accuracyThreshold: 0.8,
      realTimeCapability: false
    },
    requirements: {
      features: [],
      accuracy: 'high',
      speed: 'medium',
      interpretability: 'medium',
      scalability: 'medium'
    }
  })

  const [autoOptimization, setAutoOptimization] = useState<boolean>(true)
  const [advancedMode, setAdvancedMode] = useState<boolean>(false)
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle')
  const [validationMessage, setValidationMessage] = useState<string>('')
  const [modelRecommendations, setModelRecommendations] = useState<ModelTemplate[]>([])

  // 模型模板
  const modelTemplates: ModelTemplate[] = [
    {
      id: 'time_series_exponential_smoothing',
      name: '指数平滑',
      description: '适用于具有趋势和季节性的时间序列数据',
      category: 'forecasting',
      parameters: {
        alpha: 0.3,
        beta: 0.1,
        gamma: 0.1,
        seasonality: 7
      },
      constraints: {
        maxTrainingTime: 10000,
        memoryLimit: 256,
        accuracyThreshold: 0.75
      },
      difficulty: 'beginner',
      estimatedAccuracy: 0.8,
      trainingTime: 100,
      icon: <Zap className="w-4 h-4" />
    },
    {
      id: 'adaptive_ensemble',
      name: '自适应集成',
      description: '动态组合多个模型，自动调整权重',
      category: 'forecasting',
      parameters: {
        method: 'weighted',
        maxPredictors: 10,
        adaptationThreshold: 0.1
      },
      constraints: {
        maxTrainingTime: 300000,
        memoryLimit: 1024,
        accuracyThreshold: 0.85
      },
      difficulty: 'advanced',
      estimatedAccuracy: 0.92,
      trainingTime: 500,
      icon: <Brain className="w-4 h-4" />
    },
    {
      id: 'statistical_anomaly_detection',
      name: '统计异常检测',
      description: '基于统计学方法的异常检测',
      category: 'anomaly_detection',
      parameters: {
        method: 'zscore',
        threshold: 2.5,
        windowSize: 50
      },
      constraints: {
        maxTrainingTime: 5000,
        memoryLimit: 128,
        accuracyThreshold: 0.9
      },
      difficulty: 'intermediate',
      estimatedAccuracy: 0.85,
      trainingTime: 50,
      icon: <AlertTriangle className="w-4 h-4" />
    }
  ]

  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig)
    }
  }, [currentConfig])

  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(config)
    }
  }, [config, onConfigChange])

  // 智能参数推荐
  const generateRecommendations = useCallback(() => {
    const recommendations = modelTemplates.filter(template => {
      if (config.requirements?.accuracy === 'high' && template.estimatedAccuracy < 0.85) return false
      if (config.requirements?.speed === 'high' && template.trainingTime > 200) return false
      if (config.requirements?.interpretability === 'high' && template.difficulty === 'advanced') return false
      return true
    }).sort((a, b) => b.estimatedAccuracy - a.estimatedAccuracy).slice(0, 3)

    setModelRecommendations(recommendations)
  }, [config.requirements])

  useEffect(() => {
    generateRecommendations()
  }, [generateRecommendations])

  // 配置验证
  const validateConfiguration = useCallback(async () => {
    if (!onValidateConfig) return

    setValidationStatus('validating')
    try {
      const isValid = await onValidateConfig(config)
      setValidationStatus(isValid ? 'valid' : 'invalid')
      setValidationMessage(isValid ? '配置验证通过' : '配置存在问题，请检查参数设置')
    } catch (error) {
      setValidationStatus('invalid')
      setValidationMessage(`验证失败: ${error}`)
    }
  }, [config, onValidateConfig])

  // 应用模型模板
  const applyModelTemplate = useCallback((template: ModelTemplate) => {
    setConfig(prev => ({
      ...prev,
      algorithm: template.id,
      name: `${template.name}预测任务`,
      parameters: { ...template.parameters },
      constraints: { ...template.constraints }
    }))
  }, [])

  // 自动优化参数
  const optimizeParameters = useCallback(() => {
    // 基于需求自动调整参数
    const optimizedParams = { ...config.parameters }

    if (config.requirements?.accuracy === 'high') {
      optimizedParams.ensembleSize = Math.max((optimizedParams.ensembleSize as number) || 5, 10)
      optimizedParams.maxDepth = Math.max((optimizedParams.maxDepth as number) || 5, 10)
    }

    if (config.requirements?.speed === 'high') {
      optimizedParams.maxIterations = Math.min((optimizedParams.maxIterations as number) || 100, 50)
      optimizedParams.batchSize = Math.max((optimizedParams.batchSize as number) || 32, 128)
    }

    setConfig(prev => ({
      ...prev,
      parameters: optimizedParams
    }))

    setAutoOptimization(true)
  }, [config.parameters, config.requirements])

  // 创建预测任务
  const createPredictionTask = useCallback(async () => {
    if (!onTaskCreate) return

    const task: PredictionTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.name || '自定义预测任务',
      type: inferTaskType(),
      description: `基于${config.algorithm}的${config.requirements?.accuracy || '中等'}精度预测`,
      priority: 'medium',
      constraints: config.constraints,
      requirements: config.requirements
    }

    try {
      await onTaskCreate(task)
    } catch (error) {
      console.error('创建预测任务失败:', error)
    }
  }, [config, onTaskCreate])

  // 推断任务类型
  const inferTaskType = (): 'forecasting' | 'anomaly_detection' | 'classification' | 'regression' => {
    if (config.algorithm.includes('anomaly')) return 'anomaly_detection'
    if (config.algorithm.includes('time_series') || config.algorithm.includes('forecast')) return 'forecasting'
    if (config.algorithm.includes('classification')) return 'classification'
    return 'regression'
  }

  const updateConfig = useCallback((updates: Partial<PredictionConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }, [])

  const updateParameters = useCallback((key: string, value: unknown) => {
    setConfig(prev => ({
      ...prev,
      parameters: { ...prev.parameters, [key]: value }
    }))
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">智能配置面板</h2>
          <p className="text-muted-foreground">
            配置预测模型参数、构建工作流程、启用智能优化
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="advanced-mode"
            checked={advancedMode}
            onCheckedChange={setAdvancedMode}
          />
          <Label htmlFor="advanced-mode">高级模式</Label>
        </div>
      </div>

      {/* 智能推荐 */}
      {modelRecommendations.length > 0 && (
        <Alert>
          <Brain className="h-4 w-4" />
          <AlertTitle>智能推荐</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <p>基于您的需求，我们推荐以下模型：</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                {modelRecommendations.map(template => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => applyModelTemplate(template)}>
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        {template.icon}
                        <span className="font-medium">{template.name}</span>
                        <Badge variant={template.difficulty === 'beginner' ? 'secondary' :
                                       template.difficulty === 'intermediate' ? 'default' : 'destructive'}>
                          {template.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                      <div className="mt-2 text-xs">
                        <span className="text-green-600">预计精度: {(template.estimatedAccuracy * 100).toFixed(1)}%</span>
                        <span className="ml-2 text-blue-600">训练时间: {template.trainingTime}ms</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">基本配置</TabsTrigger>
          <TabsTrigger value="parameters">参数设置</TabsTrigger>
          <TabsTrigger value="constraints">约束条件</TabsTrigger>
          <TabsTrigger value="validation">验证与部署</TabsTrigger>
        </TabsList>

        {/* 基本配置 */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>任务基本信息</CardTitle>
              <CardDescription>
                设置预测任务的基本属性和要求
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-name">任务名称</Label>
                  <Input
                    id="task-name"
                    value={config.name}
                    onChange={(e) => updateConfig({ name: e.target.value })}
                    placeholder="输入预测任务名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="algorithm">算法选择</Label>
                  <Select value={config.algorithm} onValueChange={(value) => updateConfig({ algorithm: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map(model => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                      {modelTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.icon} {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>性能要求</Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>准确度</Label>
                    <Select value={config.requirements?.accuracy || 'medium'} onValueChange={(value: 'high' | 'medium' | 'low') =>
                      updateConfig({ requirements: { ...config.requirements, features: config.requirements?.features || [], accuracy: value } })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">高</SelectItem>
                        <SelectItem value="medium">中</SelectItem>
                        <SelectItem value="low">低</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>速度</Label>
                    <Select value={config.requirements?.speed || 'medium'} onValueChange={(value: 'high' | 'medium' | 'low') =>
                      updateConfig({ requirements: { ...config.requirements, features: config.requirements?.features || [], speed: value } })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">高</SelectItem>
                        <SelectItem value="medium">中</SelectItem>
                        <SelectItem value="low">低</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>可解释性</Label>
                    <Select value={config.requirements?.interpretability || 'medium'} onValueChange={(value: 'high' | 'medium' | 'low') =>
                      updateConfig({ requirements: { ...config.requirements, features: config.requirements?.features || [], interpretability: value } })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">高</SelectItem>
                        <SelectItem value="medium">中</SelectItem>
                        <SelectItem value="low">低</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>可扩展性</Label>
                    <Select value={config.requirements?.scalability || 'medium'} onValueChange={(value: 'high' | 'medium' | 'low') =>
                      updateConfig({ requirements: { ...config.requirements, features: config.requirements?.features || [], scalability: value } })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">高</SelectItem>
                        <SelectItem value="medium">中</SelectItem>
                        <SelectItem value="low">低</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-optimization"
                  checked={autoOptimization}
                  onCheckedChange={setAutoOptimization}
                />
                <Label htmlFor="auto-optimization">启用智能参数优化</Label>
              </div>

              {autoOptimization && (
                <Button onClick={optimizeParameters} variant="outline" className="w-full">
                  <Brain className="w-4 h-4 mr-2" />
                  智能优化参数
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 数据预处理配置 */}
          <Card>
            <CardHeader>
              <CardTitle>数据预处理</CardTitle>
              <CardDescription>
                配置数据清洗、特征工程和预处理参数
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="normalize"
                    checked={config.preprocessing?.normalize}
                    onCheckedChange={(checked) => updateConfig({
                      preprocessing: { ...config.preprocessing!, normalize: checked }
                    })}
                  />
                  <Label htmlFor="normalize">数据标准化</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="feature-engineering"
                    checked={config.preprocessing?.featureEngineering}
                    onCheckedChange={(checked) => updateConfig({
                      preprocessing: { ...config.preprocessing!, featureEngineering: checked }
                    })}
                  />
                  <Label htmlFor="feature-engineering">自动特征工程</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="outlier-removal"
                    checked={config.preprocessing?.outlierRemoval}
                    onCheckedChange={(checked) => updateConfig({
                      preprocessing: { ...config.preprocessing!, outlierRemoval: checked }
                    })}
                  />
                  <Label htmlFor="outlier-removal">异常值处理</Label>
                </div>
                <div className="space-y-2">
                  <Label>缺失值处理</Label>
                  <Select value={config.preprocessing?.handleMissing} onValueChange={(value: 'interpolate' | 'mean' | 'median' | 'drop') =>
                    updateConfig({ preprocessing: { ...config.preprocessing!, handleMissing: value } })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interpolate">插值填充</SelectItem>
                      <SelectItem value="mean">均值填充</SelectItem>
                      <SelectItem value="median">中位数填充</SelectItem>
                      <SelectItem value="drop">删除行</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 参数设置 */}
        <TabsContent value="parameters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>模型参数</CardTitle>
              <CardDescription>
                精细调整模型参数以优化性能
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-6">
                  {/* 动态参数配置 */}
                  {config.algorithm === 'adaptive_ensemble' && (
                    <div className="space-y-4">
                      <h4 className="font-medium">集成参数</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>集成方法: {(config.parameters.method as string) || 'weighted'}</Label>
                          <Select value={(config.parameters.method as string) || 'weighted'} onValueChange={(value) => updateParameters('method', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weighted">加权平均</SelectItem>
                              <SelectItem value="voting">投票</SelectItem>
                              <SelectItem value="stacking">堆叠</SelectItem>
                              <SelectItem value="averaging">简单平均</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>最大预测器数量: {(config.parameters.maxPredictors as number) || 10}</Label>
                          <Slider
                            value={[(config.parameters.maxPredictors as number) || 10]}
                            onValueChange={([value]) => updateParameters('maxPredictors', value)}
                            max={20}
                            min={2}
                            step={1}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {config.algorithm.includes('exponential_smoothing') && (
                    <div className="space-y-4">
                      <h4 className="font-medium">指数平滑参数</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Alpha (水平): {((config.parameters.alpha as number) || 0.3).toFixed(2)}</Label>
                          <Slider
                            value={[(config.parameters.alpha as number) || 0.3]}
                            onValueChange={([value]) => updateParameters('alpha', value)}
                            max={1}
                            min={0}
                            step={0.01}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Beta (趋势): {((config.parameters.beta as number) || 0.1).toFixed(2)}</Label>
                          <Slider
                            value={[(config.parameters.beta as number) || 0.1]}
                            onValueChange={([value]) => updateParameters('beta', value)}
                            max={1}
                            min={0}
                            step={0.01}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {config.algorithm.includes('anomaly_detection') && (
                    <div className="space-y-4">
                      <h4 className="font-medium">异常检测参数</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>检测方法</Label>
                          <Select value={(config.parameters.method as string)} onValueChange={(value) => updateParameters('method', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="zscore">Z-Score</SelectItem>
                              <SelectItem value="iqr">四分位距</SelectItem>
                              <SelectItem value="isolation">孤立森林</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>阈值: {(config.parameters.threshold as number) || 2.5}</Label>
                          <Slider
                            value={[(config.parameters.threshold as number) || 2.5]}
                            onValueChange={([value]) => updateParameters('threshold', value)}
                            max={4}
                            min={1}
                            step={0.1}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 通用参数 */}
                  <div className="space-y-4">
                    <h4 className="font-medium">通用参数</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>随机种子</Label>
                        <Input
                          type="number"
                          value={(config.parameters.randomSeed as number) || 42}
                          onChange={(e) => updateParameters('randomSeed', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>最大迭代次数: {(config.parameters.maxIterations as number) || 100}</Label>
                        <Slider
                          value={[(config.parameters.maxIterations as number) || 100]}
                          onValueChange={([value]) => updateParameters('maxIterations', value)}
                          max={1000}
                          min={10}
                          step={10}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 约束条件 */}
        <TabsContent value="constraints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>系统约束</CardTitle>
              <CardDescription>
                设置训练时间、内存使用等资源约束
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>最大训练时间: {((config.constraints?.maxTrainingTime || 300000) / 1000).toFixed(0)}秒</Label>
                  <Slider
                    value={[config.constraints?.maxTrainingTime || 300000]}
                    onValueChange={([value]) => updateConfig({
                      constraints: { ...config.constraints!, maxTrainingTime: value }
                    })}
                    max={600000}
                    min={10000}
                    step={10000}
                  />
                </div>
                <div className="space-y-2">
                  <Label>内存限制: {config.constraints?.memoryLimit || 1024}MB</Label>
                  <Slider
                    value={[config.constraints?.memoryLimit || 1024]}
                    onValueChange={([value]) => updateConfig({
                      constraints: { ...config.constraints!, memoryLimit: value }
                    })}
                    max={8192}
                    min={128}
                    step={128}
                  />
                </div>
                <div className="space-y-2">
                  <Label>准确度阈值: {((config.constraints?.accuracyThreshold || 0.8) * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[(config.constraints?.accuracyThreshold || 0.8) * 100]}
                    onValueChange={([value]) => updateConfig({
                      constraints: { ...config.constraints!, accuracyThreshold: value / 100 }
                    })}
                    max={100}
                    min={50}
                    step={1}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="realtime-capability"
                    checked={config.constraints?.realTimeCapability}
                    onCheckedChange={(checked) => updateConfig({
                      constraints: { ...config.constraints!, realTimeCapability: checked }
                    })}
                  />
                  <Label htmlFor="realtime-capability">实时预测能力</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 验证与部署 */}
        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>配置验证</CardTitle>
              <CardDescription>
                验证配置正确性并创建预测任务
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button onClick={validateConfiguration} disabled={isProcessing}>
                  验证配置
                </Button>
                {validationStatus === 'valid' && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    验证通过
                  </div>
                )}
                {validationStatus === 'invalid' && (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    验证失败
                  </div>
                )}
              </div>

              {validationMessage && (
                <Alert variant={validationStatus === 'valid' ? 'default' : 'destructive'}>
                  <AlertDescription>{validationMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>配置摘要</Label>
                <div className="bg-muted p-3 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(config, null, 2)}
                  </pre>
                </div>
              </div>

              <Button
                onClick={createPredictionTask}
                disabled={validationStatus !== 'valid' || isProcessing}
                className="w-full"
              >
                {isProcessing ? '创建中...' : '创建预测任务'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default IntelligentConfigPanel