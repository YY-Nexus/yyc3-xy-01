import { generateText } from "ai"
import { AI_ROLES, analyzeQueryComplexity, getCoordinatedPrompt } from "@/lib/ai_roles"
import { reportError } from "@/lib/global-error-handler"

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message) {
      return Response.json({ error: "消息内容不能为空" }, { status: 400 })
    }

    // 分析查询复杂度和涉及角色
    const { complexity, involvedRoles } = analyzeQueryComplexity(message)

    // 简单问题直接返回单角色响应
    if (complexity === "simple") {
      const role = involvedRoles[0]
      const roleConfig = AI_ROLES[role]

      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        system: getCoordinatedPrompt(message, [role]),
        prompt: message,
      })

      return Response.json({
        complexity,
        mainRole: role,
        mainResponse: text,
        roleName: roleConfig.name,
        roleIcon: roleConfig.icon,
      })
    }

    // 中等复杂度：主角色响应 + 补充视角
    if (complexity === "medium") {
      const mainRole = involvedRoles[0]
      const supportRole = involvedRoles[1]

      // 并行请求两个角色的响应
      const [mainResponse, supportResponse] = await Promise.all([
        generateText({
          model: "openai/gpt-4o-mini",
          system: AI_ROLES[mainRole].systemPrompt,
          prompt: message,
        }),
        generateText({
          model: "openai/gpt-4o-mini",
          system: `基于"${AI_ROLES[supportRole].name}"的视角，针对以下问题给出补充建议（50字以内）：`,
          prompt: message,
        }),
      ])

      return Response.json({
        complexity,
        mainRole,
        mainResponse: mainResponse.text,
        roleName: AI_ROLES[mainRole].name,
        roleIcon: AI_ROLES[mainRole].icon,
        supportingInsights: [
          {
            role: supportRole,
            roleName: AI_ROLES[supportRole].name,
            roleIcon: AI_ROLES[supportRole].icon,
            insight: supportResponse.text,
          },
        ],
      })
    }

    // 复杂问题：多角色协同响应
    const coordinatedPrompt = getCoordinatedPrompt(message, involvedRoles)

    // 生成综合响应
    const { text: mainText } = await generateText({
      model: "openai/gpt-4o-mini",
      system: coordinatedPrompt,
      prompt: message,
    })

    // 生成各角色的专项建议
    const roleInsights = await Promise.all(
      involvedRoles.slice(1, 4).map(async (role) => {
        const { text } = await generateText({
          model: "openai/gpt-4o-mini",
          system: `你是"${AI_ROLES[role].name}"，请从你的专业角度给出一条简短建议（30字以内）：`,
          prompt: message,
        })
        return {
          role,
          roleName: AI_ROLES[role].name,
          roleIcon: AI_ROLES[role].icon,
          insight: text,
        }
      }),
    )

    // 生成行动建议
    const { text: actionsText } = await generateText({
      model: "openai/gpt-4o-mini",
      system: "基于上述分析，给出3条具体可行的行动建议，每条15字以内，用|分隔：",
      prompt: `问题：${message}\n分析：${mainText}`,
    })

    const suggestedActions = actionsText
      .split("|")
      .map((a) => a.trim())
      .filter(Boolean)

    return Response.json({
      complexity,
      mainRole: involvedRoles[0],
      mainResponse: mainText,
      roleName: AI_ROLES[involvedRoles[0]].name,
      roleIcon: AI_ROLES[involvedRoles[0]].icon,
      supportingInsights: roleInsights,
      suggestedActions,
      involvedRoles: involvedRoles.map((r) => ({
        id: r,
        name: AI_ROLES[r].name,
        icon: AI_ROLES[r].icon,
      })),
    })
  } catch (error) {
    reportError(error as Error, { component: 'AIOrchestratorAPI', action: 'orchestrateResponse', endpoint: '/api/ai/orchestrate' })
    return Response.json({ error: "AI协同响应失败，请稍后重试" }, { status: 500 })
  }
}
