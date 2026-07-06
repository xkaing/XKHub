import { deepseek, type DeepSeekLanguageModelOptions } from '@ai-sdk/deepseek'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'

import { getSuancaiSystemPrompt, suancaiProfile } from '@/lib/ai/suancai-profile'

export const maxDuration = 60

const DEFAULT_MODEL = suancaiProfile.model

type ChatRequest = {
  messages?: UIMessage[]
  model?: string
  thinking?: 'enabled' | 'disabled' | 'adaptive'
  workspaceMode?: 'assistant' | 'data' | 'report'
}

function getModelName(model: unknown) {
  if (typeof model !== 'string') return process.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL
  return model.trim() || process.env.DEEPSEEK_MODEL || DEFAULT_MODEL
}

function getThinkingMode(thinking: unknown): ChatRequest['thinking'] {
  if (thinking === 'enabled' || thinking === 'disabled' || thinking === 'adaptive') return thinking
  return suancaiProfile.thinking
}

function getStreamErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return `DeepSeek 请求失败：${error.message}`
  return 'DeepSeek 请求失败，请检查 API Key、模型名和服务端日志。'
}

export async function POST(req: Request) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return Response.json({ error: '缺少 DEEPSEEK_API_KEY，请在 .env.local 中配置后重启 dev server。' }, { status: 500 })
  }

  const body = (await req.json()) as ChatRequest
  const messages = body.messages ?? []
  const model = getModelName(body.model)
  const thinking = getThinkingMode(body.thinking)

  const result = streamText({
    model: deepseek(model),
    system: getSuancaiSystemPrompt(),
    messages: await convertToModelMessages(messages),
    providerOptions: {
      deepseek: {
        thinking: { type: thinking },
      } satisfies DeepSeekLanguageModelOptions,
    },
  })

  return result.toUIMessageStreamResponse({
    onError: getStreamErrorMessage,
  })
}
