'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LucideProps } from 'lucide-react'
import {
  BookOpen,
  Search,
  Download,
  Share,
  Printer,
  Bookmark,
  BookmarkCheck,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Brain,
  Target,
  Award,
  Lightbulb,
  X
} from 'lucide-react'

// 手册章节接口
interface ManualChapter {
  id: string
  title: string
  description: string
  icon: React.ComponentType<LucideProps>
  sections: ManualSection[]
  estimatedReadTime: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
}

// 手册章节内容
interface ManualSection {
  id: string
  title: string
  content: string
  type: 'text' | 'video' | 'image' | 'interactive'
  media?: string
  tips?: string[]
  warnings?: string[]
  relatedTopics?: string[]
}

// 手册内容配置
const manualChapters: ManualChapter[] = [
  {
    id: 'getting-started',
    title: '快速入门指南',
    description: '了解YYC³ AI小语系统的基本功能和使用方法',
    icon: BookOpen,
    estimatedReadTime: 10,
    difficulty: 'beginner',
    tags: ['基础', '入门', '必读'],
    sections: [
      {
        id: 'welcome',
        title: '欢迎使用YYC³ AI小语',
        content: `YYC³ AI小语是一个专为0-22岁儿童设计的智能成长守护平台。通过AI技术，我们为每个孩子提供个性化的成长记录、智能分析和贴心陪伴。

        **核心价值：**
        - 🎯 个性化记录：每个孩子的成长轨迹都是独一无二的
        - 🤖 AI智能助手：7x24小时专业育儿指导
        - 📊 数据驱动成长：科学分析，精准建议
        - ❤️ 温暖陪伴：用技术传递爱与关怀

        **适合人群：**
        - 准父母和新生儿家庭
        - 0-6岁婴幼儿家庭
        - 6-22岁青少年家庭
        - 关注儿童成长的教育工作者`,
        type: 'text',
        tips: [
          '建议先完成新手指引，快速了解系统功能',
          '可以根据孩子的年龄段选择合适的功能模块',
          '定期查看使用建议，获得更好的体验'
        ]
      },
      {
        id: 'account-setup',
        title: '账户设置与配置',
        content: `**第一步：创建家庭账户**
        1. 使用邮箱或手机号注册账户
        2. 设置安全的登录密码
        3. 完善家庭基本信息
        4. 添加家庭成员信息

        **第二步：为孩子创建档案**
        1. 填写孩子基本信息（姓名、生日、性别）
        2. 设置成长里程碑提醒
        3. 选择AI助手风格偏好
        4. 配置隐私设置权限

        **第三步：个性化设置**
        1. 选择界面主题风格
        2. 设置通知偏好
        3. 配置数据备份方式
        4. 连接智能设备（如需）`,
        type: 'text',
        warnings: [
          '请使用真实邮箱注册，以便接收重要通知',
          '密码建议包含大小写字母、数字和特殊字符',
          '定期更新密码，确保账户安全'
        ]
      },
      {
        id: 'basic-navigation',
        title: '界面导航与基础操作',
        content: `**主界面布局：**
        - **顶部导航栏**：快速访问核心功能
        - **侧边功能菜单**：详细的分类功能
        - **中央内容区**：主要功能展示
        - **底部状态栏**：系统信息和快捷操作

        **基础操作技巧：**
        - 点击图标进入对应功能
        - 长按显示更多选项
        - 滑动切换内容页面
        - 双击放大查看详情

        **常用快捷键：**
        - Ctrl/Cmd + S：保存当前内容
        - Ctrl/Cmd + F：搜索功能
        - ESC：返回上一级
        - F11：全屏模式`,
        type: 'text',
        tips: [
          '建议收藏常用功能，提高操作效率',
          '定期清理缓存，保持系统流畅',
          '关注更新提示，体验新功能'
        ]
      }
    ]
  },
  {
    id: 'core-features',
    title: '核心功能详解',
    description: '深入了解每个核心功能的使用方法和最佳实践',
    icon: Star,
    estimatedReadTime: 20,
    difficulty: 'intermediate',
    tags: ['功能', '详解', '进阶'],
    sections: [
      {
        id: 'ai-chat-feature',
        title: 'AI小语智能助手',
        content: `**功能概述：**
        AI小语智能助手是系统的核心功能，提供7x24小时的专业育儿指导和陪伴服务。

        **五种专业角色：**
        1. **育儿专家**：专业的育儿知识问答
        2. **心理医生**：儿童心理健康指导
        3. **营养师**：科学饮食建议
        4. **早教老师**：早期教育指导
        5. **生活管家**：日常生活协助

        **使用方法：**
        1. 点击聊天图标进入对话界面
        2. 选择合适的AI助手角色
        3. 通过语音或文字进行对话
        4. 获取专业建议和指导

        **高级功能：**
        - 语音识别和合成
        - 情感分析和回应
        - 个性化内容推荐
        - 历史对话记录`,
        type: 'text',
        tips: [
          '根据具体问题选择合适的AI角色',
          '语音交互更自然，文字交互更准确',
          '可以收藏重要对话内容',
          '定期清理对话历史，保护隐私'
        ]
      },
      {
        id: 'growth-tracking-feature',
        title: '成长记录追踪',
        content: `**功能特点：**
        - 多媒体记录：照片、视频、文字、音频
        - 智能分类：自动识别和标签生成
        - 时间线展示：清晰的成长脉络
        - 里程碑提醒：重要发育节点提示

        **记录内容：**
        - 身体发育：身高、体重、头围
        - 运动发展：爬行、走路、跑步
        - 语言发展：发音、词汇、句子
        - 认知发展：学习、记忆、理解
        - 社交发展：互动、分享、合作
        - 情感发展：情绪表达、自我认知

        **最佳实践：**
        - 每日坚持记录，形成完整档案
        - 注重质量而非数量
        - 捕捉真实的成长瞬间
        - 定期回顾和分析数据`,
        type: 'text',
        warnings: [
          '记录时注意保护孩子隐私',
          '避免过度记录影响生活质量',
          '理性看待数据，避免焦虑'
        ]
      },
      {
        id: 'data-visualization-feature',
        title: '数据可视化分析',
        content: `**图表类型：**
        1. **生长曲线图**：身高、体重、头围发育趋势
        2. **能力雷达图**：五维度能力发展评估
        3. **活动统计图**：日常活动时间分布
        4. **里程碑时间轴**：重要发育节点记录
        5. **对比分析图**：同龄段数据对比

        **数据分析：**
        - 发育趋势评估
        - 能力平衡性分析
        - 成长速度计算
        - 异常数据预警
        - 个性化建议生成

        **使用技巧：**
        - 定期查看数据报告
        - 关注异常变化提示
        - 结合实际情况解读数据
        - 与医生或专家讨论结果`,
        type: 'text',
        tips: [
          '数据仅供参考，具体情况请咨询专业人士',
          '定期备份数据，防止丢失',
          '可以导出数据用于医疗咨询'
        ]
      }
    ]
  },
  {
    id: 'advanced-features',
    title: '高级功能应用',
    description: '掌握高级功能，充分发挥系统的智能化优势',
    icon: Brain,
    estimatedReadTime: 25,
    difficulty: 'advanced',
    tags: ['高级', '智能化', '专业'],
    sections: [
      {
        id: 'smart-album-feature',
        title: '智能相册管理',
        content: `**AI功能特色：**
        - **人脸识别**：自动识别家庭成员
        - **场景分析**：理解照片内容和环境
        - **情感检测**：分析人物情绪状态
        - **质量评估**：照片质量自动评分
        - **智能分类**：按内容自动整理

        **管理功能：**
        - 批量标签管理
        - 智能搜索过滤
        - 相似图片合并
        - 自动备份同步
        - 隐私保护设置

        **高级设置：**
        - 调整AI识别精度
        - 自定义分类规则
        - 设置存储空间配额
        - 配置分享权限`,
        type: 'text',
        tips: [
          '定期训练AI识别模型，提高准确度',
          '设置合理的存储管理策略',
          '注意备份重要照片和数据'
        ]
      },
      {
        id: 'voice-story-feature',
        title: 'AI语音故事生成',
        content: `**创作模式：**
        1. **模板模式**：基于预设故事模板
        2. **自由创作**：完全自定义故事内容
        3. **互动模式**：根据孩子回答调整情节
        4. **连续创作**：系列故事自动生成

        **故事类型：**
        - 睡前故事：温馨、舒缓
        - 教育故事：知识性、启发性
        - 冒险故事：刺激、想象力
        - 生日故事：特殊、纪念意义
        - 行为习惯：培养好习惯

        **语音设置：**
        - 语速调节：适合不同年龄
        - 语调选择：温柔、活泼、神奇
        - 音质优化：清晰、自然
        - 背景音乐：舒缓、配套

        **个性化定制：**
        - 根据孩子年龄调整内容复杂度
        - 融入家庭成员和生活场景
        - 结合当前发展重点
        - 考虑孩子兴趣爱好`,
        type: 'text',
        warnings: [
          '控制听故事时间，保护听力',
          '内容要符合孩子年龄特点',
          '避免过于刺激的内容影响睡眠'
        ]
      },
      {
        id: 'birthday-theme-feature',
        title: '生日主题模式',
        content: `**专属功能：**
        - **生日倒计时**：精确到秒的倒计时
        - **庆祝动画**：节日氛围装饰效果
        - **生日歌曲**：专属生日歌库
        - **成长回顾**：一年成长历程总结
        - **愿望清单**：生日愿望收集

        **主题设置：**
        - 个性化颜色方案
        - 定制动画效果
        - 特殊音效配置
        - 家长寄语展示
        - 亲友祝福收集

        **互动功能：**
        - 虚拟蛋糕切分
        - 礼物开箱动画
        - 拍照留念功能
        - 社交媒体分享
        - 电子贺卡制作

        **记忆保存：**
        - 自动记录庆祝过程
        - 生成纪念视频
        - 保存亲友祝福
        - 创建成长相册`,
        type: 'text',
        tips: [
          '提前准备照片和视频素材',
          '邀请亲友参与线上庆祝',
          '做好网络连接准备'
        ]
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: '常见问题解答',
    description: '解决使用过程中遇到的各种问题',
    icon: HelpCircle,
    estimatedReadTime: 15,
    difficulty: 'beginner',
    tags: ['FAQ', '问题', '解决'],
    sections: [
      {
        id: 'technical-issues',
        title: '技术问题',
        content: `**Q: 系统运行缓慢怎么办？**
        A: 1. 检查网络连接稳定性
           2. 清理浏览器缓存
           3. 关闭不必要的后台程序
           4. 尝试刷新页面或重新登录

        **Q: 语音功能无法使用？**
        A: 1. 检查麦克风权限设置
           2. 确认浏览器支持Web Speech API
           3. 检查音频设备连接
           4. 尝试使用其他浏览器

        **Q: 数据同步失败？**
        A: 1. 检查网络连接
           2. 确认登录状态正常
           3. 检查服务器状态
           4. 手动触发同步

        **Q: 照片上传失败？**
        A: 1. 检查照片格式和大小
           2. 确认存储空间充足
           3. 检查网络连接稳定性
           4. 尝试压缩后重新上传`,
        type: 'text'
      },
      {
        id: 'usage-issues',
        title: '使用问题',
        content: `**Q: AI助手回答不准确？**
        A: 1. 尝试重新描述问题
           2. 选择更合适的AI角色
           3. 提供更多背景信息
           4. 使用更清晰的语言表达

        **Q: 数据分析结果异常？**
        A: 1. 检查输入数据的准确性
           2. 确认年龄信息正确
           3. 查看数据采集时间
           4. 联系技术支持核实

        **Q: 忘记密码怎么办？**
        A: 1. 使用忘记密码功能
           2. 输入注册邮箱或手机号
           3. 按照邮件/短信提示重置
           4. 联系客服协助处理

        **Q: 如何导出数据？**
        A: 1. 进入设置中心
           2. 选择数据管理
           3. 选择导出格式
           4. 确认导出范围和时间`,
        type: 'text'
      },
      {
        id: 'privacy-security',
        title: '隐私与安全',
        content: `**Q: 数据安全如何保障？**
        A: 1. 使用企业级加密技术
           2. 多重身份验证机制
           3. 定期安全审计和更新
           4. 符合国际隐私保护标准

        **Q: 如何保护孩子隐私？**
        A: 1. 设置合理的分享权限
           2. 避免在公开平台分享敏感信息
           3. 定期检查隐私设置
           4. 教育孩子保护个人隐私

        **Q: 数据会被第三方使用吗？**
        A: 1. 严格遵守隐私政策
           2. 未经同意不会分享数据
           3. 匿名化处理用于AI训练
           4. 可随时选择退出数据收集

        **Q: 如何删除所有数据？**
        A: 1. 联系客服申请删除
           2. 确认身份后执行删除
           3. 所有数据永久删除
           4. 7天内可恢复`,
        type: 'text',
        warnings: [
          '请妥善保管账户信息',
          '定期更新密码保护安全',
          '注意保护孩子个人信息'
        ]
      }
    ]
  },
  {
    id: 'best-practices',
    title: '最佳实践建议',
    description: '专业育儿建议和使用技巧，帮助您更好地使用系统',
    icon: Award,
    estimatedReadTime: 20,
    difficulty: 'intermediate',
    tags: ['建议', '技巧', '优化'],
    sections: [
      {
        id: 'daily-usage-tips',
        title: '日常使用技巧',
        content: `**高效记录习惯：**
        1. **固定时间记录**：每天固定时间记录成长数据
        2. **简化记录流程**：创建常用模板，快速记录
        3. **多维度记录**：不仅记录身体发育，也要记录行为表现
        4. **及时整理**：定期整理和分类记录内容

        **AI对话技巧：**
        1. **明确问题**：清晰描述要咨询的问题
        2. **提供背景**：分享相关的背景信息
        3. **追问细节**：对不明确的回答进一步询问
        4. **实践验证**：将建议应用到实际生活中

        **数据管理策略：**
        1. **定期备份**：重要数据定期云端备份
        2. **分类存储**：按类型和重要性分类存储
        3. **版本管理**：保留重要记录的历史版本
        4. **权限控制**：合理设置数据访问权限`,
        type: 'text',
        tips: [
          '建立固定的使用习惯，避免遗忘',
          '与家庭成员分享使用心得',
          '定期回顾和调整使用策略'
        ]
      },
      {
        id: 'parenting-advice',
        title: '专业育儿建议',
        content: `**成长发育关注：**
        1. **个体差异**：尊重每个孩子的独特发育节奏
        2. **全面发展**：关注身体、认知、情感、社交全面发展
        3. **环境刺激**：提供丰富但不过度的成长环境
        4. **及时干预**：发现问题及时寻求专业帮助

        **亲子关系建设：**
        1. **高质量陪伴**：专注、投入的陪伴胜过长时间相处
        2. **有效沟通**：倾听孩子心声，理解其需求
        3. **情感支持**：提供无条件的爱和安全感
        4. **榜样作用**：通过自身行为影响孩子成长

        **教育理念更新：**
        1. **终身学习**：育儿是不断学习的过程
        2. **科学方法**：基于科学的育儿知识和方法
        3. **灵活调整**：根据孩子特点调整教育策略
        4. **平衡发展**：不过分强调某一方面的能力`,
        type: 'text',
        warnings: [
          '避免盲目比较，每个孩子都有自己的节奏',
          '不要过度依赖工具，保持与孩子的真实互动',
          '遇到严重问题及时咨询专业人士'
        ]
      },
      {
        id: 'community-sharing',
        title: '社区互动经验',
        content: `**经验分享平台：**
        1. **用户社区**：与其他家长交流育儿心得
        2. **专家问答**：向专业育儿专家提问
        3. **案例分析**：学习成功育儿案例
        4. **资源共享**：分享优质育儿资源

        **参与方式：**
        1. **积极提问**：不要害羞，大胆提出问题
        2. **分享经验**：帮助其他家长解决困惑
        3. **理性讨论**：尊重不同观点和选择
        4. **持续学习**：保持开放的学习心态

        **注意事项：**
        1. **隐私保护**：分享时注意保护隐私信息
        2. **信息甄别**：理性判断信息可靠性
        3. **避免焦虑**：不要过度比较造成焦虑
        4. **专业咨询**：严重问题咨询专业人士`,
        type: 'text',
        tips: [
          '加入育儿社群，获得更多支持',
          '定期参加线上线下活动',
          '建立自己的育儿支持网络'
        ]
      }
    ]
  }
]

export default function ParentUserManual() {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(['getting-started']))
  const [bookmarkedSections, setBookmarkedSections] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  // 过滤章节
  const filteredChapters = manualChapters.filter(chapter => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      chapter.title.toLowerCase().includes(query) ||
      chapter.description.toLowerCase().includes(query) ||
      chapter.tags.some(tag => tag.toLowerCase().includes(query)) ||
      chapter.sections.some(section =>
        section.title.toLowerCase().includes(query) ||
        section.content.toLowerCase().includes(query)
      )
    )
  })

  // 切换章节展开状态
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev)
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId)
      } else {
        newSet.add(chapterId)
      }
      return newSet
    })
  }

  // 切换书签
  const toggleBookmark = (sectionId: string) => {
    setBookmarkedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  // 获取难度颜色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100'
      case 'intermediate': return 'text-yellow-600 bg-yellow-100'
      case 'advanced': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // 获取难度文本
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '入门'
      case 'intermediate': return '进阶'
      case 'advanced': return '高级'
      default: return '未知'
    }
  }

  // 导出手册
  const exportManual = () => {
    const manualContent = manualChapters.map(chapter => {
      return `${chapter.title}\n${'='.repeat(50)}\n${chapter.description}\n\n${chapter.sections.map(section =>
        `${section.title}\n${'-'.repeat(30)}\n${section.content}`
      ).join('\n\n')}`
    }).join('\n\n\n')

    const blob = new Blob([manualContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `YYC3用户手册_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题区域 */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
            📚 家长使用手册
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            详细的操作指南和专业育儿建议，帮助您更好地使用YYC³ AI小语系统
          </p>

          {/* 搜索栏 */}
          <div className="flex justify-center mt-6">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索手册内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={exportManual}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              下载手册
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2">
              <Share className="w-4 h-4" />
              分享手册
            </button>
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2">
              <Printer className="w-4 h-4" />
              打印手册
            </button>
          </div>
        </motion.div>

        {/* 统计信息 */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { label: '章节总数', value: manualChapters.length, icon: BookOpen, color: 'from-blue-500 to-purple-500' },
            { label: '阅读时长', value: `${manualChapters.reduce((sum, ch) => sum + ch.estimatedReadTime, 0)}分钟`, icon: Clock, color: 'from-green-500 to-blue-500' },
            { label: '收藏内容', value: bookmarkedSections.size, icon: Bookmark, color: 'from-purple-500 to-pink-500' },
            { label: '难度覆盖', value: '3级', icon: Target, color: 'from-orange-500 to-red-500' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* 手册内容 */}
        <div className="space-y-6">
          {filteredChapters.map((chapter, chapterIndex) => {
            const Icon = chapter.icon
            const isExpanded = expandedChapters.has(chapter.id)
            const bookmarkedCount = chapter.sections.filter(section => bookmarkedSections.has(section.id)).length

            return (
              <motion.div
                key={chapter.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + chapterIndex * 0.1 }}
              >
                {/* 章节头部 */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleChapter(chapter.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                        <Icon className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{chapter.title}</h3>
                        <p className="text-gray-600 mb-3">{chapter.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">{chapter.estimatedReadTime}分钟</span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(chapter.difficulty)}`}>
                            {getDifficultyText(chapter.difficulty)}
                          </div>
                          {bookmarkedCount > 0 && (
                            <div className="flex items-center gap-1 text-yellow-600">
                              <BookmarkCheck className="w-4 h-4" />
                              <span>{bookmarkedCount}个收藏</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-2">
                          {chapter.tags.map((tag, index) => (
                            <span key={index} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-6 h-6 text-gray-500 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* 章节内容 */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className="border-t"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-6 space-y-8">
                        {chapter.sections.map((section) => {
                          const isBookmarked = bookmarkedSections.has(section.id)

                          return (
                            <div key={section.id} className="border-l-4 border-purple-200 pl-6">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-lg font-semibold text-gray-800">{section.title}</h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleBookmark(section.id)
                                  }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    isBookmarked
                                      ? 'bg-yellow-100 text-yellow-600'
                                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                  }`}
                                >
                                  {isBookmarked ? (
                                    <BookmarkCheck className="w-4 h-4" />
                                  ) : (
                                    <Bookmark className="w-4 h-4" />
                                  )}
                                </button>
                              </div>

                              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                                {section.content}
                              </div>

                              {/* 提示 */}
                              {section.tips && section.tips.length > 0 && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                  <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                                    <Lightbulb className="w-4 h-4" />
                                    <span>温馨提示</span>
                                  </div>
                                  <ul className="space-y-1">
                                    {section.tips.map((tip, tipIndex) => (
                                      <li key={tipIndex} className="text-sm text-blue-600 flex items-start gap-2">
                                        <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        <span>{tip}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* 警告 */}
                              {section.warnings && section.warnings.length > 0 && (
                                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                                  <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>重要提醒</span>
                                  </div>
                                  <ul className="space-y-1">
                                    {section.warnings.map((warning, warningIndex) => (
                                      <li key={warningIndex} className="text-sm text-red-600 flex items-start gap-2">
                                        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        <span>{warning}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* 底部帮助信息 */}
        <motion.div
          className="mt-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4">需要更多帮助？</h3>
          <p className="text-gray-700 mb-6">
            我们的客服团队随时为您提供专业的技术支持和育儿指导
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 shadow-md">
              <MessageCircle className="w-4 h-4" />
              在线客服
            </button>
            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 shadow-md">
              <Mail className="w-4 h-4" />
              邮件支持
            </button>
            <button className="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 shadow-md">
              <Phone className="w-4 h-4" />
              电话支持
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
