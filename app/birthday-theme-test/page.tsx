'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Toggle } from '@/components/ui/toggle'
import { BirthdayThemeProvider } from '@/components/theme/BirthdayThemeProvider'
import BirthdayDecorations from '@/components/theme/BirthdayDecorations'
import XiaoyuMemorialAlbum from '@/components/theme/XiaoyuMemorialAlbum'
import BirthdayCountdown from '@/components/theme/BirthdayCountdown'
import { useBirthdayTheme } from '@/components/theme/BirthdayThemeProvider'
import {
  Palette,
  Gift,
  Cake,
  Sparkles,
  Settings,
  Eye,
  Heart,
  Music,
  Star
} from 'lucide-react'

// 主题控制面板
function ThemeControlPanel() {
  const { theme, updateTheme, toggleDecorations, decorations, sound } = useBirthdayTheme()

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          主题控制面板
        </CardTitle>
        <CardDescription>
          自定义生日主题的外观和效果
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 颜色控制 */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              主题颜色
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm">主色调</label>
                <input
                  type="color"
                  value={theme.colors.primary}
                  onChange={(e) => updateTheme({
                    colors: { ...theme.colors, primary: e.target.value }
                  })}
                  className="w-16 h-8 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">次色调</label>
                <input
                  type="color"
                  value={theme.colors.secondary}
                  onChange={(e) => updateTheme({
                    colors: { ...theme.colors, secondary: e.target.value }
                  })}
                  className="w-16 h-8 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">强调色</label>
                <input
                  type="color"
                  value={theme.colors.accent}
                  onChange={(e) => updateTheme({
                    colors: { ...theme.colors, accent: e.target.value }
                  })}
                  className="w-16 h-8 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 装饰控制 */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              装饰元素
            </h4>
            <div className="space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">气球</span>
                <Toggle
                  pressed={decorations.balloons}
                  onPressedChange={() => toggleDecorations('balloons')}
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">彩带</span>
                <Toggle
                  pressed={decorations.confetti}
                  onPressedChange={() => toggleDecorations('confetti')}
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">星星</span>
                <Toggle
                  pressed={decorations.sparkles}
                  onPressedChange={() => toggleDecorations('sparkles')}
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">丝带</span>
                <Toggle
                  pressed={decorations.ribbons}
                  onPressedChange={() => toggleDecorations('ribbons')}
                />
              </label>
            </div>
          </div>

          {/* 动画和音效控制 */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Music className="w-4 h-4" />
              动画与音效
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">启用动画</span>
                <Toggle
                  pressed={theme.animations.enabled}
                  onPressedChange={(enabled) => updateTheme({
                    animations: { ...theme.animations, enabled }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">音效</span>
                <Toggle
                  pressed={sound.enabled}
                  onPressedChange={(enabled) => updateTheme({
                    sound: { ...sound, enabled }
                  })}
                />
              </div>
              {sound.enabled && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">音量</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={sound.volume}
                    onChange={(e) => updateTheme({
                      sound: { ...sound, volume: parseFloat(e.target.value) }
                    })}
                    className="w-20"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 主题预览组件
function ThemePreview() {
  const { theme } = useBirthdayTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-600" />
          主题预览
        </CardTitle>
        <CardDescription>
          查看当前主题效果
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 按钮样式预览 */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">按钮样式</h4>
            <div className="flex gap-2 flex-wrap">
              <button
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: theme.colors.primary }}
              >
                主色调按钮
              </button>
              <button
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: theme.colors.secondary }}
              >
                次色调按钮
              </button>
              <button
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: theme.colors.accent }}
              >
                强调色按钮
              </button>
            </div>
          </div>

          {/* 文字样式预览 */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">文字样式</h4>
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                color: theme.colors.primary,
                fontFamily: theme.fonts.heading
              }}
            >
              标题文字样式
            </h1>
            <p
              className="mb-2"
              style={{
                color: theme.colors.text,
                fontFamily: theme.fonts.body
              }}
            >
              这是正文文字，使用了主题的文字样式。
            </p>
            <p
              className="text-sm"
              style={{
                color: theme.colors.textSecondary,
                fontFamily: theme.fonts.decorative
              }}
            >
              这是装饰性文字样式，用于特殊场合。
            </p>
          </div>

          {/* 卡片样式预览 */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">卡片样式</h4>
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: theme.colors.surface,
                border: `2px solid ${theme.colors.primary}`
              }}
            >
              <h5
                className="font-semibold mb-2"
                style={{ color: theme.colors.text }}
              >
                卡片标题
              </h5>
              <p style={{ color: theme.colors.textSecondary }}>
                这是一个使用主题样式的卡片组件。
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function BirthdayThemeTest() {
  const [activeTab, setActiveTab] = useState('theme')
  const [showDecorations, setShowDecorations] = useState(true)

  return (
    <BirthdayThemeProvider>
      <div className="min-h-screen relative">
        {/* 生日装饰背景 */}
        {showDecorations && <BirthdayDecorations />}

        {/* 主要内容 */}
        <div className="relative z-10">
          {/* 页面标题 */}
          <div className="text-center mb-8 pt-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-2">
              🎂 生日主题包装测试
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Day 5-7: 生日主题包装 - UI设计、个性化内容定制、节日元素集成
            </p>
          </div>

          {/* 控制面板 */}
          <div className="max-w-7xl mx-auto px-4 pb-8">
            <ThemeControlPanel />

            {/* 功能测试标签页 */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="theme" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  主题配置
                </TabsTrigger>
                <TabsTrigger value="decorations" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  节日装饰
                </TabsTrigger>
                <TabsTrigger value="countdown" className="flex items-center gap-2">
                  <Cake className="w-4 h-4" />
                  生日倒计时
                </TabsTrigger>
                <TabsTrigger value="album" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  纪念册
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  效果预览
                </TabsTrigger>
              </TabsList>

              <TabsContent value="theme" className="mt-6">
                <ThemePreview />
              </TabsContent>

              <TabsContent value="decorations" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-purple-600" />
                      节日装饰元素
                    </CardTitle>
                    <CardDescription>
                      体验丰富的生日主题装饰效果
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl">
                        <h3 className="font-semibold text-purple-800 mb-3">🎈 气球效果</h3>
                        <p className="text-purple-700 mb-4">
                          彩色气球会从底部缓缓升起，带有轻微摆动效果。点击气球可以&quot;戳破&quot;它们！
                        </p>
                        <div className="text-sm text-purple-600">
                          <div>• 8个不同颜色的气球</div>
                          <div>• 真实的摆动动画</div>
                          <div>• 点击爆裂效果</div>
                          <div>• 爆炸粒子特效</div>
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl">
                        <h3 className="font-semibold text-orange-800 mb-3">🎉 彩带效果</h3>
                        <p className="text-orange-700 mb-4">
                          彩色纸片从上方飘落，模拟真实的派对氛围。
                        </p>
                        <div className="text-sm text-orange-600">
                          <div>• 15个彩纸粒子</div>
                          <div>• 多种颜色组合</div>
                          <div>• 循环飘落动画</div>
                          <div>• 自然的物理效果</div>
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
                        <h3 className="font-semibold text-blue-800 mb-3">✨ 星星闪烁</h3>
                        <p className="text-blue-700 mb-4">
                          金色星星会在随机位置闪烁发光。
                        </p>
                        <div className="text-sm text-blue-600">
                          <div>• 10个闪光星星</div>
                          <div>• 渐现渐隐效果</div>
                          <div>• 360度旋转动画</div>
                          <div>• 金色光晕效果</div>
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                        <h3 className="font-semibold text-green-800 mb-3">🎗️ 丝带装饰</h3>
                        <p className="text-green-700 mb-4">
                          彩色丝带从顶部垂下，营造节日氛围。
                        </p>
                        <div className="text-sm text-green-600">
                          <div>• 4条彩色丝带</div>
                          <div>• 轻柔摆动效果</div>
                          <div>• 渐变透明度</div>
                          <div>• 多层次设计</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => setShowDecorations(!showDecorations)}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                          showDecorations
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {showDecorations ? '隐藏装饰' : '显示装饰'}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="countdown" className="mt-6">
                <BirthdayCountdown />
              </TabsContent>

              <TabsContent value="album" className="mt-6">
                <XiaoyuMemorialAlbum />
              </TabsContent>

              <TabsContent value="preview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-purple-600" />
                      主题效果总结
                    </CardTitle>
                    <CardDescription>
                      查看所有已完成的功能特性
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* 功能清单 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
                          <h3 className="font-semibold text-purple-800 mb-3">🎨 UI设计完成</h3>
                          <ul className="space-y-2 text-purple-700">
                            <li>✅ 主题提供者系统</li>
                            <li>✅ 自定义颜色配置</li>
                            <li>✅ 动画时长控制</li>
                            <li>✅ 字体样式定制</li>
                            <li>✅ 音效系统集成</li>
                          </ul>
                        </div>

                        <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                          <h3 className="font-semibold text-blue-800 mb-3">👶 个性化内容</h3>
                          <ul className="space-y-2 text-blue-700">
                            <li>✅ 小语专属纪念册</li>
                            <li>✅ 照片轮播系统</li>
                            <li>✅ 成长故事展示</li>
                            <li>✅ 家庭成员记录</li>
                            <li>✅ 标签化内容管理</li>
                          </ul>
                        </div>

                        <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                          <h3 className="font-semibold text-orange-800 mb-3">🎉 节日元素</h3>
                          <ul className="space-y-2 text-orange-700">
                            <li>✅ 生日倒计时组件</li>
                            <li>✅ 动态气球装饰</li>
                            <li>✅ 彩带飘落效果</li>
                            <li>✅ 星星闪烁动画</li>
                            <li>✅ 丝带装饰设计</li>
                          </ul>
                        </div>

                        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                          <h3 className="font-semibold text-green-800 mb-3">🔧 技术特性</h3>
                          <ul className="space-y-2 text-green-700">
                            <li>✅ Framer Motion动画</li>
                            <li>✅ CSS变量系统</li>
                            <li>✅ 响应式设计</li>
                            <li>✅ 性能优化</li>
                            <li>✅ 主题切换流畅</li>
                          </ul>
                        </div>
                      </div>

                      {/* 使用统计 */}
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                        <h3 className="font-semibold text-purple-800 mb-4">📊 Day 5-7 成果统计</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">4</div>
                            <div className="text-sm text-gray-600">核心组件</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">15+</div>
                            <div className="text-sm text-gray-600">动画效果</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">100%</div>
                            <div className="text-sm text-gray-600">响应式</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">∞</div>
                            <div className="text-sm text-gray-600">定制性</div>
                          </div>
                        </div>
                      </div>

                      {/* 主题特色 */}
                      <div className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                        <h3 className="font-semibold text-purple-800 mb-3">🌟 主题特色亮点</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1 flex-shrink-0" />
                            <div>
                              <strong>智能适配:</strong>
                              根据日期自动激活生日主题，在小语生日前后营造庆祝氛围
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1 flex-shrink-0" />
                            <div>
                              <strong>温馨设计:</strong>
                              采用粉紫色调为主，营造温暖、欢乐的生日氛围
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1 flex-shrink-0" />
                            <div>
                              <strong>丰富交互:</strong>
                              可点击的气球、可自定义的主题参数、流畅的动画过渡
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1 flex-shrink-0" />
                            <div>
                              <strong>情感关怀:</strong>
                              专为小语设计的纪念册和倒计时，充满家庭爱意
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1 flex-shrink-0" />
                            <div>
                              <strong>模块化架构:</strong>
                              组件化设计，易于复用和扩展，支持主题级定制
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1 flex-shrink-0" />
                            <div>
                              <strong>性能优化:</strong>
                              使用CSS变量和React优化技术，确保流畅的用户体验
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </BirthdayThemeProvider>
  )
}
