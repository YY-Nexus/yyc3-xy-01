import { selectRoleByContext, type AIRole } from "@/lib/ai_roles"
import { reportError } from "@/lib/global-error-handler"

// 预设的干净回复集合 - 彻底避免重复
const CLEAN_RESPONSES = {
  greetings: [
    "您好！我是小语AI助手，很高兴为您提供育儿帮助。今天想聊什么呢？",
    "你好！很高兴见到您。我是您的专属育儿小助手小语。",
    "欢迎！我是小语，让我们一起为宝宝的成长努力吧。"
  ],
  music: [
    "音乐启蒙可以从简单的儿歌开始，这有助于宝宝的语言发展和节奏感培养。",
    "给宝宝听音乐是个很好的选择，建议选择旋律简单、节奏明快的儿歌。",
    "音乐能够促进宝宝的大脑发育，建议每天安排15-20分钟的音乐时间。"
  ],
  learning: [
    "早期教育应该以游戏为主，在快乐中学习效果最好。",
    "宝宝的学习主要通过游戏和探索来完成，建议提供丰富的感官体验。",
    "在玩耍中学习是最好的方式，让宝宝在快乐的氛围中自然成长。"
  ],
  safety: [
    "安全是第一位的。请确保宝宝活动区域的防护措施到位。",
    "宝宝的安全意识需要从小培养，同时家长要做好防护工作。",
    "家中的安全隐患要及时排除，为宝宝创造安全的成长环境。"
  ],
  sleep: [
    "良好的睡眠习惯对宝宝成长至关重要，建议建立规律作息。",
    "充足的睡眠有助于宝宝的身体发育和大脑成长。",
    "建议建立固定的睡前程序，帮助宝宝养成良好的睡眠习惯。"
  ],
  eating: [
    "辅食添加要循序渐进，注意观察宝宝的接受程度。",
    "宝宝的饮食要多样化，确保营养均衡搭配。",
    "添加新食物时要观察3-5天，确保没有过敏反应。"
  ],
  role: {
    recorder: "信息已记录。持续的记录有助于了解宝宝的成长轨迹。",
    guardian: "宝宝的安全和健康是首要关注，请确保环境安全。",
    listener: "我理解您的感受。每个孩子都有自己的成长节奏。",
    advisor: "建议建立规律的作息时间，这对宝宝成长发育很重要。",
    cultural: "文化启蒙是一个循序渐进的过程，让我们一起努力。",
    all: "感谢您的分享。我会继续为您提供全面的育儿建议。"
  },
  default: [
    "感谢您的分享。作为您的育儿助手，我会竭诚为您提供专业的建议和支持。",
    "我理解您的 concerns。让我们一起来为宝宝创造更好的成长环境。",
    "育儿路上我们一起努力。有什么具体问题随时可以问我。"
  ]
}

// 简单干净的回复函数 - 彻底避免重复
function generateLocalResponse(message: string, role?: string): string {
  const cleanMessage = message.trim().toLowerCase()

  // 根据关键词选择合适的回复类别
  if (cleanMessage.includes('你好') || cleanMessage.includes('嗨') || cleanMessage.includes('hi') || cleanMessage.includes('在吗')) {
    const responses = CLEAN_RESPONSES.greetings
    return responses[Math.floor(Math.random() * responses.length)]
  }

  if (cleanMessage.includes('音乐') || cleanMessage.includes('儿歌') || cleanMessage.includes('唱歌') || cleanMessage.includes('听歌')) {
    const responses = CLEAN_RESPONSES.music
    return responses[Math.floor(Math.random() * responses.length)]
  }

  if (cleanMessage.includes('学习') || cleanMessage.includes('教育') || cleanMessage.includes('教') || cleanMessage.includes('学')) {
    const responses = CLEAN_RESPONSES.learning
    return responses[Math.floor(Math.random() * responses.length)]
  }

  if (cleanMessage.includes('安全') || cleanMessage.includes('危险') || cleanMessage.includes('防护')) {
    const responses = CLEAN_RESPONSES.safety
    return responses[Math.floor(Math.random() * responses.length)]
  }

  if (cleanMessage.includes('睡觉') || cleanMessage.includes('睡眠') || cleanMessage.includes('作息') || cleanMessage.includes('晚上')) {
    const responses = CLEAN_RESPONSES.sleep
    return responses[Math.floor(Math.random() * responses.length)]
  }

  if (cleanMessage.includes('吃饭') || cleanMessage.includes('辅食') || cleanMessage.includes('食物') || cleanMessage.includes('喂养')) {
    const responses = CLEAN_RESPONSES.eating
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 角色特定回复
  if (role && CLEAN_RESPONSES.role[role as keyof typeof CLEAN_RESPONSES.role]) {
    return CLEAN_RESPONSES.role[role as keyof typeof CLEAN_RESPONSES.role]
  }

  // 默认回复
  const defaultResponses = CLEAN_RESPONSES.default
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}

export async function POST(request: Request) {
  try {
    const { message, role, complexity } = await request.json()

    const selectedRole: AIRole = role || selectRoleByContext(message)

    // 生成干净的回复
    const responseContent = generateLocalResponse(message, selectedRole)

    // 模拟流式响应
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 模拟逐字输出
          const words = responseContent.split('')
          let currentText = ''

          for (let i = 0; i < words.length; i++) {
            currentText += words[i]
            const data = JSON.stringify({
              content: currentText,
              role: selectedRole,
              complexity,
            })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            // 添加延迟来模拟真实的AI响应
            await new Promise(resolve => setTimeout(resolve, 30))
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
          controller.close()
        } catch (error) {
          reportError(error as Error, { component: 'AIChatAPI', action: 'streamResponse', endpoint: '/api/ai/chat' })
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    reportError(error as Error, { component: 'AIChatAPI', action: 'processRequest', endpoint: '/api/ai/chat' })
    return new Response(JSON.stringify({ error: "处理失败，请稍后重试" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}