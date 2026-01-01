/**
 * @file 角色系统演示页面
 * @description 完整的角色系统和主题化UI组件演示
 * @author YYC³ Development Team
 * @version 1.0.0
 * @created 2024-12-14
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CharacterThemeProvider,
  CharacterInput,
  CharacterContainer,
  CharacterAlert
} from '@/components/ui'
import { useCharacterTheme } from '@/components/ui/CharacterThemeContext'

interface MockChild {
  id: string
  name: string
  nickname: string
  gender: 'male' | 'female'
  birth_date: Date
  current_stage: string
  created_at: Date
  updated_at: Date
}

const mockUsers: MockChild[] = [
  {
    id: '1',
    name: '小美',
    nickname: '小美',
    gender: 'female',
    birth_date: new Date('2022-03-15'),
    current_stage: '幼儿期',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '2',
    name: '小明',
    nickname: '小明',
    gender: 'male',
    birth_date: new Date('2022-06-20'),
    current_stage: '幼儿期',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '3',
    name: '小花',
    nickname: '小花',
    gender: 'female',
    birth_date: new Date('2023-01-10'),
    current_stage: '婴儿期',
    created_at: new Date(),
    updated_at: new Date()
  }
]

export default function CharacterSystemDemo() {
  const [selectedUser, setSelectedUser] = useState<MockChild | null>(mockUsers[0])
  const [showAlert, setShowAlert] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [theme, setTheme] = useState('')
  const [expression, setExpression] = useState('')

  const { state } = useCharacterTheme()
  const { currentCharacter } = state

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎭 YYC³ 角色系统演示
          </h1>
          <p className="text-gray-600">
            完整的角色管理和主题化UI组件系统
          </p>
        </motion.div>

        {/* 主题提供者包装整个应用 */}
        <CharacterThemeProvider child={selectedUser}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* 左侧：角色选择和控制面板 */}
            <div className="space-y-6">
              {/* 用户选择器 */}
              <CharacterContainer variant="card">
                <h2 className="text-xl font-bold mb-4">选择用户</h2>
                <div className="space-y-2">
                  {mockUsers.map((user) => (
                    <motion.button
                      key={user.id}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${
                        selectedUser?.id === user.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          user.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'
                        }`}>
                          {user.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">
                            {user.gender === 'female' ? '女孩' : '男孩'} · {user.current_stage}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CharacterContainer>

              {/* 角色信息展示 */}
              <CharacterContainer variant="card">
                <h2 className="text-xl font-bold mb-4">角色信息</h2>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        selectedUser?.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'
                      }`}>
                        {selectedUser?.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-lg">{selectedUser?.name}</div>
                        <div className="text-sm text-gray-500">
                          {selectedUser?.gender === 'female' ? '女孩' : '男孩'} · {selectedUser?.current_stage}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>主题选择：
                        <select
                          value={theme}
                          onChange={(e) => setTheme(e.target.value)}
                          className="ml-2 px-2 py-1 border rounded"
                        >
                          <option value="">默认</option>
                          <option value={selectedUser?.gender === 'female' ? 'pink' : 'blue'}>
                            {selectedUser?.gender === 'female' ? '粉色主题' : '蓝色主题'}
                          </option>
                        </select>
                      </div>
                      <div>表情选择：
                        <select
                          value={expression}
                          onChange={(e) => setExpression(e.target.value)}
                          className="ml-2 px-2 py-1 border rounded"
                        >
                          <option value="">默认</option>
                          <option value="happy">开心</option>
                          <option value="thinking">思考</option>
                          <option value="sad">伤心</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </CharacterContainer>
            </div>

            {/* 中间：表单和交互组件 */}
            <div className="space-y-6">
              {/* 角色展示 */}
              <CharacterContainer variant="gradient">
                <h2 className="text-xl font-bold text-white mb-4">角色展示</h2>
                <div className="flex justify-center">
                  <div className="relative">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-bold ${
                      selectedUser?.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'
                    }`}>
                      {selectedUser?.name.charAt(0)}
                    </div>
                    {expression && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-full text-xs border shadow-sm">
                        {expression === 'happy' ? '😊' : expression === 'thinking' ? '🤔' : '😢'}
                      </div>
                    )}
                  </div>
                </div>
              </CharacterContainer>

              {/* 表单演示 */}
              <CharacterContainer variant="card">
                <h2 className="text-xl font-bold mb-4">主题化表单</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <CharacterInput
                    label="用户名"
                    placeholder="请输入用户名"
                    characterIcon
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />

                  <CharacterInput
                    label="邮箱地址"
                    type="email"
                    placeholder="请输入邮箱"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    helper="我们不会分享您的邮箱"
                  />

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedUser?.gender === 'female'
                          ? 'bg-pink-500 text-white hover:bg-pink-600'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      提交
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ name: '', email: '' })}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium border transition-colors ${
                        selectedUser?.gender === 'female'
                          ? 'border-pink-300 text-pink-700 hover:bg-pink-50'
                          : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      重置
                    </button>
                  </div>
                </form>
              </CharacterContainer>

              {/* 按钮演示 */}
              <CharacterContainer variant="card">
                <h2 className="text-xl font-bold mb-4">主题化按钮</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    selectedUser?.gender === 'female'
                      ? 'bg-pink-500 text-white hover:bg-pink-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}>
                    主要按钮
                  </button>
                  <button className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    selectedUser?.gender === 'female'
                      ? 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}>
                    次要按钮
                  </button>
                  <button className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
                    selectedUser?.gender === 'female'
                      ? 'border-pink-300 text-pink-700 hover:bg-pink-50'
                      : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                  }`}>
                    边框按钮
                  </button>
                  <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedUser?.gender === 'female'
                      ? 'text-pink-600 hover:bg-pink-50'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}>
                    幽灵按钮
                  </button>
                  <button disabled className={`px-6 py-3 text-lg rounded-lg font-medium opacity-50 cursor-not-allowed ${
                    selectedUser?.gender === 'female'
                      ? 'bg-pink-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}>
                    加载中...
                  </button>
                  <button disabled className={`px-6 py-3 text-lg rounded-lg font-medium border opacity-50 cursor-not-allowed ${
                    selectedUser?.gender === 'female'
                      ? 'border-pink-300 text-pink-400'
                      : 'border-blue-300 text-blue-400'
                  }`}>
                    禁用状态
                  </button>
                </div>
              </CharacterContainer>
            </div>

            {/* 右侧：提示和状态组件 */}
            <div className="space-y-6">
              {/* 提示组件演示 */}
              <CharacterContainer variant="card">
                <h2 className="text-xl font-bold mb-4">提示组件</h2>
                <div className="space-y-3">
                  <CharacterAlert
                    type="info"
                    message="这是一个信息提示"
                    characterMood="happy"
                    dismissible
                  />
                  <CharacterAlert
                    type="success"
                    message="操作成功完成！"
                    characterMood="excited"
                    autoDismiss
                    autoDismissDelay={2000}
                  />
                  <CharacterAlert
                    type="warning"
                    message="请注意检查输入内容"
                    characterMood="thinking"
                  />
                  <CharacterAlert
                    type="error"
                    message="发生错误，请重试"
                    characterMood="cool"
                    dismissible
                  />
                </div>
              </CharacterContainer>

              {/* 容器变体演示 */}
              <CharacterContainer variant="card">
                <h2 className="text-xl font-bold mb-4">容器样式</h2>
                <div className="space-y-3">
                  <CharacterContainer variant="default" size="small" padding="sm">
                    默认样式容器
                  </CharacterContainer>
                  <CharacterContainer variant="card" size="small" padding="sm">
                    卡片样式容器
                  </CharacterContainer>
                  <CharacterContainer variant="glass" size="small" padding="sm">
                    毛玻璃效果容器
                  </CharacterContainer>
                  <CharacterContainer variant="outlined" size="small" padding="sm">
                    边框样式容器
                  </CharacterContainer>
                </div>
              </CharacterContainer>

              {/* 动态提示 */}
              {showAlert && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CharacterAlert
                    type="success"
                    message="表单提交成功！"
                    characterMood="excited"
                    onDismiss={() => setShowAlert(false)}
                  />
                </motion.div>
              )}

              {/* 角色信息展示 */}
              {currentCharacter && (
                <CharacterContainer variant="gradient">
                  <h2 className="text-xl font-bold text-white mb-4">当前角色信息</h2>
                  <div className="space-y-2 text-white">
                    <div className="flex justify-between">
                      <span>姓名：</span>
                      <span>{currentCharacter.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>性别：</span>
                      <span>{currentCharacter.gender === 'female' ? '女' : '男'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>性格：</span>
                      <span>{currentCharacter.personality.traits.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>经典用语：</span>
                      <span className="text-sm italic">
                        "{currentCharacter.personality.catchphrases[0]}"
                      </span>
                    </div>
                  </div>
                </CharacterContainer>
              )}
            </div>
          </div>

          {/* 底部功能说明 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <CharacterContainer variant="card" size="large">
              <h2 className="text-2xl font-bold mb-4 text-center">🎨 系统特性</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">👫</div>
                  <h3 className="font-bold mb-1">智能角色切换</h3>
                  <p className="text-sm text-gray-600">
                    根据用户性别自动切换小语(女孩)和小言(男孩)
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🎨</div>
                  <h3 className="font-bold mb-1">主题化设计</h3>
                  <p className="text-sm text-gray-600">
                    6种配色方案，完整的主题化UI组件库
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">✨</div>
                  <h3 className="font-bold mb-1">流畅动画</h3>
                  <p className="text-sm text-gray-600">
                    Framer Motion驱动的微交互动画
                  </p>
                </div>
              </div>
            </CharacterContainer>
          </motion.div>
        </CharacterThemeProvider>
      </div>
    </div>
  )
}