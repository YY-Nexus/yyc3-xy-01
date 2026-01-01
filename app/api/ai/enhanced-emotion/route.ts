import { enhancedEmotionFusion } from "@/lib/ai/enhanced-emotion-fusion"

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { text, audioFeatures, facialFeatures, bodyLanguage, context } = body

    // 构建多模态输入
    const multimodalInput = {
      text,
      audioData: audioFeatures ? { features: audioFeatures, duration: body.audioDuration || 1 } : undefined,
      videoData: facialFeatures || bodyLanguage ? {
        facialFeatures: facialFeatures || {},
        bodyLanguage: bodyLanguage || {}
      } : undefined,
      behavioralData: {
        attention: body.attention || 0.5,
        activity: body.activity || 'unknown',
        context: body.situation || 'home'
      },
      context: {
        age: context?.age || 1,
        previousEmotions: context?.previousEmotions || [],
        environment: context?.environment || 'home'
      }
    }

    // 执行增强情感融合
    const emotionResult = await enhancedEmotionFusion.fuseEmotions(multimodalInput)

    // 获取情感趋势
    const trends = enhancedEmotionFusion.getEmotionTrends(5)

    // 生成个性化建议
    const suggestions = generateEmotionBasedSuggestions(emotionResult, context)

    const response = {
      emotion: emotionResult,
      trends,
      suggestions,
      processingTime: Date.now() - startTime,
      timestamp: Date.now()
    }

    return Response.json(response)

  } catch (error) {
    console.error("[Enhanced Emotion Analysis Error]", error)
    return Response.json(
      { error: "增强情感分析失败，请稍后重试" },
      { status: 500 }
    )
  }
}

// 基于情感结果生成个性化建议
function generateEmotionBasedSuggestions(emotion: any, context?: any): string[] {
  const suggestions: string[] = []

  switch (emotion.primary) {
    case 'joy':
      suggestions.push("宝宝现在很开心，这是很好的互动时机！")
      suggestions.push("可以延续这种愉快的情绪，一起做喜欢的游戏")
      if (emotion.secondary === 'excitement') {
        suggestions.push("宝宝很兴奋，注意观察是否需要适当平静下来")
      }
      break

    case 'sadness':
      suggestions.push("宝宝需要安慰，给一个温暖的拥抱")
      suggestions.push("轻声安抚，了解宝宝不开心的原因")
      if (emotion.intensity > 0.7) {
        suggestions.push("情绪比较强烈，耐心陪伴和安抚很重要")
      }
      break

    case 'anger':
      suggestions.push("保持冷静，理解宝宝的情绪表达")
      suggestions.push("帮助宝宝用语言表达需求和感受")
      if (emotion.secondary === 'frustration') {
        suggestions.push("宝宝可能遇到了困难，给予适当的帮助和引导")
      }
      break

    case 'fear':
      suggestions.push("给予安全感，让知道你在身边")
      suggestions.push("耐心解释，帮助理解令他害怕的事物")
      if (emotion.secondary === 'anxiety') {
        suggestions.push("创造平静的环境，减少刺激")
      }
      break

    case 'surprise':
      suggestions.push("这是学习的好机会，探索新事物")
      if (emotion.secondary === 'curiosity') {
        suggestions.push("鼓励宝宝的探索欲望，提供安全的探索环境")
      }
      break

    case 'neutral':
      suggestions.push("宝宝现在比较平静，适合进行温和的活动")
      suggestions.push("观察宝宝是否想要互动或需要独处")
      break
  }

  // 年龄特化建议
  if (context?.age && context.age <= 1) {
    suggestions.push("婴儿期主要通过感官体验世界，多用声音、触觉安抚")
  } else if (context?.age && context.age <= 3) {
    suggestions.push("幼儿开始学习情绪表达，帮助认识和命名各种情绪")
  }

  // 情感强度建议
  if (emotion.intensity > 0.8) {
    suggestions.push("情绪比较强烈，需要更多的耐心和理解")
  }

  return suggestions.slice(0, 5) // 最多返回5个建议
}