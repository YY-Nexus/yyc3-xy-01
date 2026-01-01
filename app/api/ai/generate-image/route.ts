import { type NextRequest, NextResponse } from "next/server"
import { reportError } from "@/lib/global-error-handler"

// 风格提示词映射
const STYLE_PROMPTS: Record<string, string> = {
  cartoon: "cartoon style, vibrant colors, cute characters, child-friendly, disney-like",
  watercolor: "watercolor painting, soft colors, artistic, dreamy, fluid strokes",
  sketch: "simple line drawing, minimalist, clean lines, sketch style, pencil art",
  anime: "anime style, japanese animation, colorful, expressive eyes, manga",
  storybook: "storybook illustration, warm colors, cozy, narrative art, picture book",
  pixel: "pixel art, 8-bit style, retro game aesthetic, blocky, nostalgic",
  clay: "clay sculpture style, 3D rendered, soft textures, playful, claymation",
  papercut: "paper cut art, layered paper, chinese traditional, silhouette, shadow",
}

// 儿童安全词汇过滤
function sanitizePrompt(prompt: string): string {
  const blockedWords = [
    "暴力",
    "血腥",
    "恐怖",
    "武器",
    "死亡",
    "杀",
    "战争",
    "酒",
    "烟",
    "毒",
    "赌",
    "色情",
    "裸",
    "性",
  ]

  let sanitized = prompt
  blockedWords.forEach((word) => {
    sanitized = sanitized.replace(new RegExp(word, "gi"), "")
  })

  return sanitized.trim()
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, style, aspectRatio } = await req.json()

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "请提供描述内容" }, { status: 400 })
    }

    // 安全过滤
    const safePrompt = sanitizePrompt(prompt)
    if (safePrompt.length < 2) {
      return NextResponse.json({ error: "描述内容不符合要求" }, { status: 400 })
    }

    // 构建完整提示词
    const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.cartoon
    const fullPrompt = `${safePrompt}, ${stylePrompt}, child-safe, family-friendly, bright and cheerful, high quality`

    // 尺寸映射
    const sizeMap: Record<string, string> = {
      "1:1": "square_hd",
      "4:3": "landscape_4_3",
      "16:9": "landscape_16_9",
      "3:4": "portrait_4_3",
    }

    // 检查是否有fal.ai API
    const falKey = process.env.FAL_KEY

    if (falKey) {
      // 使用fal.ai生成图片
      const falResponse = await fetch("https://fal.run/fal-ai/flux/schnell", {
        method: "POST",
        headers: {
          Authorization: `Key ${falKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          image_size: sizeMap[aspectRatio] || "square_hd",
          num_inference_steps: 4,
          enable_safety_checker: true,
        }),
      })

      if (falResponse.ok) {
        const falData = await falResponse.json()
        if (falData.images && falData.images.length > 0) {
          return NextResponse.json({
            imageUrl: falData.images[0].url,
            prompt: safePrompt,
            style,
          })
        }
      }
    }

    // 降级：使用占位图
    const placeholderUrl = `/placeholder.svg?height=512&width=512&query=${encodeURIComponent(safePrompt + " " + style + " illustration")}`

    return NextResponse.json({
      imageUrl: placeholderUrl,
      prompt: safePrompt,
      style,
      isPlaceholder: true,
    })
  } catch (error) {
    reportError(error as Error, { component: 'ImageGenerationAPI', action: 'generateImage', endpoint: '/api/ai/generate-image' })
    return NextResponse.json({ error: "图片生成失败" }, { status: 500 })
  }
}
