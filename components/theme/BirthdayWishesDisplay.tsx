/**
 * @file BirthdayWishesDisplay.tsx
 * @description YYC³ AI小语智能成长守护系统生日祝福展示组件，展示所有提交的生日祝福，支持筛选和搜索功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Heart, MessageCircle, Calendar, User } from 'lucide-react'

interface BirthdayWish {
  id: string
  name: string
  message: string
  relationship: string
  templateId?: string
  isCustomMessage?: boolean
  customTitle?: string
  timestamp: string
}

const BirthdayWishesDisplay: React.FC = () => {
  const [wishes, setWishes] = useState<BirthdayWish[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRelationship, setFilterRelationship] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest')
  const [isLoading, setIsLoading] = useState(true)

  // 加载祝福数据
  useEffect(() => {
    const loadWishes = () => {
      try {
        const savedWishes = JSON.parse(localStorage.getItem('birthdayWishes') || '[]')
        setWishes(savedWishes)
      } catch (error) {
        console.error('加载祝福数据失败:', error)
        setWishes([])
      } finally {
        setIsLoading(false)
      }
    }

    loadWishes()
    
    // 监听存储变化，实时更新
    const handleStorageChange = () => {
      loadWishes()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // 获取所有关系类型
  const relationshipTypes = useMemo(() => {
    const types = new Set<string>()
    wishes.forEach(wish => {
      if (wish.relationship) types.add(wish.relationship)
    })
    return Array.from(types)
  }, [wishes])

  // 筛选和排序祝福
  const filteredAndSortedWishes = useMemo(() => {
    let filtered = wishes

    // 按搜索词筛选
    if (searchTerm) {
      filtered = filtered.filter(wish => 
        wish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wish.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (wish.customTitle && wish.customTitle.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // 按关系筛选
    if (filterRelationship !== 'all') {
      filtered = filtered.filter(wish => wish.relationship === filterRelationship)
    }

    // 排序
    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      } else if (sortBy === 'oldest') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      return 0
    })
  }, [wishes, searchTerm, filterRelationship, sortBy])

  // 格式化日期
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 清除所有祝福
  const clearAllWishes = () => {
    if (window.confirm('确定要清除所有祝福吗？此操作不可恢复。')) {
      localStorage.removeItem('birthdayWishes')
      setWishes([])
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-pink-600">生日祝福墙</h1>
        <p className="text-gray-600">查看所有为小语送上的生日祝福</p>
      </div>

      {/* 筛选和搜索控件 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            筛选和搜索
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索姓名、祝福内容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterRelationship} onValueChange={setFilterRelationship}>
              <SelectTrigger>
                <SelectValue placeholder="按关系筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有关系</SelectItem>
                {relationshipTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'name') => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">最新优先</SelectItem>
                <SelectItem value="oldest">最早优先</SelectItem>
                <SelectItem value="name">按姓名排序</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              共 {filteredAndSortedWishes.length} 条祝福
            </div>
            {wishes.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllWishes}>
                清除所有
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 祝福列表 */}
      {filteredAndSortedWishes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无祝福</h3>
            <p className="text-gray-500 text-center">
              {wishes.length === 0 
                ? "还没有人送上祝福，成为第一个送上祝福的人吧！" 
                : "没有符合筛选条件的祝福，请尝试调整筛选条件。"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAndSortedWishes.map((wish) => (
            <Card key={wish.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-pink-500" />
                    <CardTitle className="text-lg">{wish.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {wish.relationship}
                  </Badge>
                </div>
                {wish.isCustomMessage && wish.customTitle && (
                  <div className="text-sm font-medium text-pink-600 mt-1">
                    {wish.customTitle}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">{wish.message}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(wish.timestamp)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-red-500" />
                    生日祝福
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default BirthdayWishesDisplay