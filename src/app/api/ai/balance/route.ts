type DeepSeekBalanceInfo = {
  currency: string
  total_balance: string
  granted_balance: string
  topped_up_balance: string
}

type DeepSeekBalanceResponse = {
  is_available: boolean
  balance_infos: DeepSeekBalanceInfo[]
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    return Response.json({ error: '缺少 DEEPSEEK_API_KEY，请在 .env.local 中配置后重启 dev server。' }, { status: 500 })
  }

  const response = await fetch('https://api.deepseek.com/user/balance', {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    return Response.json({ error: `DeepSeek 余额查询失败：${response.status}` }, { status: 502 })
  }

  const balance = (await response.json()) as DeepSeekBalanceResponse

  return Response.json(balance, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
