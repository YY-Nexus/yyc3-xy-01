/**
 * @file BirthdayWishForm.tsx
 * @description YYC³ AI小语智能成长守护系统生日祝福表单组件，用于用户提交生日祝福的表单界面
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Heart, Star, Gift, MessageCircle, Sparkles } from 'lucide-react'

interface BirthdayWish {
  name: string
  message: string
  relationship: string
  timestamp: Date
}

interface BirthdayWishFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (wish: BirthdayWish) => void
}

export default function BirthdayWishForm({ isOpen, onClose, onSubmit }: BirthdayWishFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    relationship: '',
    templateId: '',
    isCustomMessage: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  // 生日祝福语模板
  const birthdayTemplates = [
    {
      id: 1,
      title: '温馨祝福',
      message: '亲爱的小语，生日快乐！愿你的每一天都充满阳光和欢笑，愿你的未来像星星一样璀璨夺目。在新的一岁里，愿你健康快乐，心想事成！'
    },
    {
      id: 2,
      title: '真挚祝福',
      message: '小语，生日快乐！时光荏苒，又一年过去了。愿你在新的一岁里，继续保持那份纯真与善良，勇敢追逐梦想，收获满满的幸福与成功。'
    },
    {
      id: 3,
      title: '诗意祝福',
      message: '小语，生日快乐！愿你如春花般绚烂，如夏星般闪耀，如秋叶般静美，如冬雪般纯洁。愿你的生命之树常青，幸福之花常开。'
    },
    {
      id: 4,
      title: '简约祝福',
      message: '小语，生日快乐！简单的一句话，包含最真挚的祝福：愿你健康、快乐、平安、幸福！'
    },
    {
      id: 5,
      title: '活力祝福',
      message: '小语，生日快乐！愿你的生活充满活力与激情，每一天都像生日一样精彩！愿你在新的一岁里，创造更多美好回忆！'
    },
    {
      id: 6,
      title: '感恩祝福',
      message: '小语，生日快乐！感谢你出现在我们的生命中，带来那么多美好时光。愿你的生日充满爱与温暖，新的一年里收获更多幸福与感动。'
    }
  ]

  // 选择模板
  const selectTemplate = (template: typeof birthdayTemplates[0]) => {
    setFormData(prev => ({ ...prev, message: template.message }))
    setShowTemplates(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = birthdayTemplates.find(t => t.id === templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        templateId,
        message: template.message,
        isCustomMessage: false
      }))
    }
  }

  const handleCustomMessageToggle = () => {
    setFormData(prev => ({
      ...prev,
      isCustomMessage: !prev.isCustomMessage,
      templateId: !prev.isCustomMessage ? '' : prev.templateId,
      message: !prev.isCustomMessage ? prev.message : ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 这里可以添加实际的提交逻辑，比如发送到服务器
      console.log('生日祝福表单提交:', formData)
      
      // 模拟提交延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 保存到本地存储
      const wishes = JSON.parse(localStorage.getItem('birthdayWishes') || '[]')
      wishes.push({
        id: Date.now().toString(),
        ...formData,
        timestamp: new Date().toISOString()
      })
      localStorage.setItem('birthdayWishes', JSON.stringify(wishes))
      
      // 重置表单
      setFormData({
        name: '',
        message: '',
        relationship: '',
        templateId: '',
        isCustomMessage: false,
        customTitle: ''
      })
      
      // 显示成功消息
      alert('生日祝福已成功提交！感谢您的祝福！')
    } catch (error) {
      console.error('提交失败:', error)
      alert('提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                为小语送上生日祝福
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* 表单 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 姓名输入 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  您的姓名 *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="请输入您的姓名"
                  required
                />
              </div>

              {/* 关系选择 */}
              <div>
                <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-1">
                  您和小语的关系
                </label>
                <select
                  id="relationship"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">请选择</option>
                  <option value="家人">家人</option>
                  <option value="朋友">朋友</option>
                  <option value="亲戚">亲戚</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              {/* 祝福消息 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    生日祝福 *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <Sparkles className="w-4 h-4" />
                    {showTemplates ? '隐藏模板' : '使用模板'}
                  </button>
                </div>
                
                {/* 模板选择区域 */}
                {showTemplates && (
                  <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-purple-700">选择一个祝福语模板：</p>
                      <button
                        type="button"
                        onClick={handleCustomMessageToggle}
                        className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                      >
                        {formData.isCustomMessage ? '使用模板' : '自定义'}
                      </button>
                    </div>
                    
                    {formData.isCustomMessage ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="祝福语标题（可选）"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          value={formData.customTitle || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, customTitle: e.target.value }))}
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                        {birthdayTemplates.map(template => (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => handleTemplateSelect(template.id)}
                            className={`text-left p-2 bg-white rounded border border-purple-200 hover:bg-purple-100 transition-colors ${
                              formData.templateId === template.id ? 'ring-2 ring-purple-500' : ''
                            }`}
                          >
                            <p className="font-medium text-sm text-purple-800">{template.title}</p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{template.message}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder={formData.isCustomMessage ? "写下您对小语的生日祝福..." : "您可以编辑选中的祝福语模板..."}
                  required
                />
              </div>

              {/* 提交按钮 */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>提交中...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>发送祝福</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* 装饰元素 */}
            <div className="absolute -top-2 -right-2">
              <motion.div
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </motion.div>
            </div>
            <div className="absolute -bottom-2 -left-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
