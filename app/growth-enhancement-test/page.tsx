'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import EnhancedGrowthTimeline from '@/components/growth/enhanced/EnhancedGrowthTimeline'
import EnhancedMilestoneCelebration from '@/components/growth/enhanced/EnhancedMilestoneCelebration'
import EnhancedMediaUploader from '@/components/growth/enhanced/EnhancedMediaUploader'
import {
  Clock,
  Trophy,
  Camera,
  Upload,
  Sparkles,
  Baby,
  Cake
} from 'lucide-react'

export default function GrowthEnhancementTest() {
  const [activeTab, setActiveTab] = useState('timeline')
  const [showCelebration, setShowCelebration] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<any[]>([])

  // 示例里程碑数据
  const sampleMilestone = {
    id: 'milestone_1',
    title: '小语1岁生日庆祝！',
    description: '今天是宝贝小语1岁的生日，全家人都为这个特别的日子庆祝！小语收到了好多礼物，吃了甜甜的生日蛋糕，还一起唱了生日歌。这是小语人生中第一个重要的里程碑！',
    age: '1岁整',
    category: 'birthday' as const,
    importance: 10,
    achievements: [
      '成功吹灭生日蜡烛',
      '独立完成站立拍照',
      '对生日歌产生积极反应',
      '接受全家人的祝福'
    ],
    familyReaction: [
      '爸爸妈妈感动得流泪',
      '爷爷奶奶开心的笑容',
      '全家一起唱生日歌',
      '为小语录制了珍贵视频'
    ],
    media: [
      { type: 'image' as const, url: '/birthday-1.jpg', caption: '生日蛋糕' },
      { type: 'video' as const, url: '/birthday-party.mp4', caption: '庆祝派对' }
    ],
    celebrationLevel: 'diamond' as const,
    personalizedMessage: '亲爱的小语，1岁生日快乐！愿你的每一天都像今天一样充满欢声笑语和爱。你是爸爸妈妈心中最珍贵的宝贝！'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-2">
            🌟 成长记录功能增强测试
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Day 3-4: 成长记录功能完善 - 时间线美化、里程碑庆祝动画、照片视频上传优化
          </p>
        </div>

        {/* 功能介绍 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                增强时间线
              </CardTitle>
              <CardDescription>
                美化时间线展示，添加动画效果，支持多种视图模式
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>✅ 优雅的动画效果</div>
                <div>✅ 三种视图模式</div>
                <div>✅ 智能分组展示</div>
                <div>✅ 交互式详情弹窗</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                庆祝动画
              </CardTitle>
              <CardDescription>
                炫酷的里程碑庆祝效果，多种庆祝级别
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>✅ 彩带粒子效果</div>
                <div>✅ 音符动画</div>
                <div>✅ 星星爆炸效果</div>
                <div>✅ 庆祝音效播放</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-500" />
                智能上传
              </CardTitle>
              <CardDescription>
                优化的媒体上传体验，智能标签，批量操作
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>✅ 拖拽上传支持</div>
                <div>✅ 智能标签生成</div>
                <div>✅ 缩略图预览</div>
                <div>✅ 批量管理功能</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 功能演示区域 */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="timeline" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  增强时间线
                </TabsTrigger>
                <TabsTrigger value="celebration" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  庆祝动画
                </TabsTrigger>
                <TabsTrigger value="uploader" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  智能上传
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      增强特性
                    </h3>
                    <ul className="text-sm space-y-1 text-blue-800">
                      <li>• 流畅的滚动动画和视差效果</li>
                      <li>• 三种视图模式：时间线、网格、轮播</li>
                      <li>• 智能的事件分组和筛选</li>
                      <li>• 丰富的交互式动画效果</li>
                      <li>• 详细的事件信息展示</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Baby className="w-4 h-4 text-purple-600" />
                      小语专属数据
                    </h3>
                    <p className="text-sm text-purple-800">
                      包含小语的真实成长数据：1岁生日庆祝、第一次叫妈妈、独立站立等重要里程碑
                    </p>
                  </div>

                  <div className="h-[600px] overflow-y-auto custom-scrollbar">
                    <EnhancedGrowthTimeline birthdayMode={true} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="celebration" className="mt-6">
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      庆祝动画演示
                    </h3>
                    <p className="text-sm text-yellow-800 mb-4">
                      点击下方按钮触发小语1岁生日庆祝动画，包含完整的视觉效果和音效
                    </p>
                    <Button
                      onClick={() => setShowCelebration(true)}
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    >
                      <Cake className="w-4 h-4 mr-2" />
                      触发生日庆祝
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50">
                      <h4 className="font-semibold text-yellow-800 mb-2">🎊 银色庆祝</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• 30个彩带粒子</li>
                        <li>• 3秒动画时长</li>
                        <li>• 基础光效</li>
                        <li>• 适合一般里程碑</li>
                      </ul>
                    </div>

                    <div className="p-4 border-l-4 border-orange-400 bg-orange-50">
                      <h4 className="font-semibold text-orange-800 mb-2">🏆 金色庆祝</h4>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• 50个彩带粒子</li>
                        <li>• 4秒动画时长</li>
                        <li>• 炫彩光效</li>
                        <li>• 适合重要里程碑</li>
                      </ul>
                    </div>

                    <div className="p-4 border-l-4 border-purple-400 bg-purple-50">
                      <h4 className="font-semibold text-purple-800 mb-2">💎 钻石庆祝</h4>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• 80个彩带粒子</li>
                        <li>• 5秒动画时长</li>
                        <li>• 全彩光效</li>
                        <li>• 适合超级里程碑</li>
                      </ul>
                    </div>
                  </div>

                  {/* 庆祝动画组件 */}
                  <EnhancedMilestoneCelebration
                    isVisible={showCelebration}
                    milestone={sampleMilestone}
                    onClose={() => setShowCelebration(false)}
                    onShare={(milestone) => {
                      alert(`分享里程碑: ${milestone.title}`)
                    }}
                    onSave={(milestone) => {
                      alert(`保存里程碑: ${milestone.title}`)
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="uploader" className="mt-6">
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-purple-600" />
                      智能媒体上传器
                    </h3>
                    <ul className="text-sm space-y-1 text-purple-800">
                      <li>• 支持拖拽上传和批量选择</li>
                      <li>• 自动生成智能标签（生日、里程碑、第一次等）</li>
                      <li>• 实时缩略图生成和视频时长获取</li>
                      <li>• 网格和列表两种视图模式</li>
                      <li>• 收藏和特色标记功能</li>
                      <li>• 上传进度显示和错误处理</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-green-600" />
                      功能特点
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                      <div>
                        <h4 className="font-medium mb-1">智能识别</h4>
                        <ul className="space-y-1 text-green-700">
                          <li>• 基于文件名的标签生成</li>
                          <li>• 照片和视频类型自动识别</li>
                          <li>• 高清内容智能标记</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">用户体验</h4>
                        <ul className="space-y-1 text-green-700">
                          <li>• 悬停预览和控制</li>
                          <li>• 快速批量操作</li>
                          <li>• 实时上传状态显示</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 增强上传器组件 */}
                  <EnhancedMediaUploader
                    files={mediaFiles}
                    onChange={setMediaFiles}
                    maxFiles={12}
                    maxFileSize={50}
                    enableDragDrop={true}
                    enableBatchUpload={true}
                    enableAutoTagging={true}
                    enablePreview={true}
                    uploadToCloud={false}
                    onUploadStart={(files) => {
                      console.log('开始上传:', files.length, '个文件')
                    }}
                    onUploadComplete={(files) => {
                      console.log('上传完成:', files.length, '个文件')
                    }}
                    onUploadError={(error) => {
                      console.error('上传错误:', error)
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Day 3-4 执行进度 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📊 Day 3-4 执行进度</CardTitle>
            <CardDescription>
              成长记录功能完善 - 已完成所有计划的增强功能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                  ✅
                </div>
                <div className="flex-1">
                  <div className="font-medium">时间线美化完成</div>
                  <div className="text-sm text-gray-600">创建了EnhancedGrowthTimeline组件，支持多种视图和丰富动画</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                  ✅
                </div>
                <div className="flex-1">
                  <div className="font-medium">里程碑庆祝动画完成</div>
                  <div className="text-sm text-gray-600">创建了EnhancedMilestoneCelebration组件，包含钻石级庆祝效果</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                  ✅
                </div>
                <div className="flex-1">
                  <div className="font-medium">媒体上传优化完成</div>
                  <div className="text-sm text-gray-600">创建了EnhancedMediaUploader组件，支持智能标签和批量管理</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm animate-pulse">
                  🎯
                </div>
                <div className="flex-1">
                  <div className="font-medium">集成测试进行中</div>
                  <div className="text-sm text-gray-600">创建测试页面验证所有增强功能的协同工作</div>
                </div>
              </div>
            </div>

            {/* 技术成果总结 */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3">🚀 Day 3-4 技术成果</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/70 p-3 rounded-lg">
                  <div className="font-medium text-blue-700 mb-2">前端组件</div>
                  <div className="text-gray-700">
                    <div>• 3个增强组件</div>
                    <div>• 1个测试页面</div>
                    <div>• 响应式设计</div>
                    <div>• 动画优化</div>
                  </div>
                </div>

                <div className="bg-white/70 p-3 rounded-lg">
                  <div className="font-medium text-purple-700 mb-2">用户体验</div>
                  <div className="text-gray-700">
                    <div>• 流畅动画效果</div>
                    <div>• 智能交互设计</div>
                    <div>• 多视图模式</div>
                    <div>• 批量操作支持</div>
                  </div>
                </div>

                <div className="bg-white/70 p-3 rounded-lg">
                  <div className="font-medium text-pink-700 mb-2">小语定制</div>
                  <div className="text-gray-700">
                    <div>• 生日主题优化</div>
                    <div>• 专属数据展示</div>
                    <div>• 温馨视觉效果</div>
                    <div>• 家庭情感关怀</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 下一步计划 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🗓️ 接下来: Day 5-7 计划</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border-l-4 border-pink-500 bg-pink-50">
                <div className="font-semibold text-pink-800 mb-2">🎨 生日主题UI设计</div>
                <ul className="text-sm text-pink-700 space-y-1">
                  <li>• 全站生日主题包装</li>
                  <li>• 温馨色彩搭配</li>
                  <li>• 节日元素集成</li>
                  <li>• 动态主题切换</li>
                </ul>
              </div>

              <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                <div className="font-semibold text-purple-800 mb-2">👶 个性化内容定制</div>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• 小语专属内容</li>
                  <li>• 照片轮播展示</li>
                  <li>• 成长纪念册</li>
                  <li>• 家庭故事集成</li>
                </ul>
              </div>

              <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                <div className="font-semibold text-blue-800 mb-2">🎉 节日元素集成</div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 气球动画效果</li>
                  <li>• 蛋糕装饰元素</li>
                  <li>• 礼物开启动画</li>
                  <li>• 庆祝音效集成</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}