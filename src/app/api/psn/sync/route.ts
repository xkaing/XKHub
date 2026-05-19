import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const execFileAsync = promisify(execFile)

export async function POST() {
  if (!process.env.PSN_NPSSO) {
    return NextResponse.json(
      {
        error: '服务器没有配置 PSN_NPSSO，暂时不能从页面直接同步。',
      },
      { status: 400 }
    )
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        error: '服务器缺少 Supabase URL 或 service role key。',
      },
      { status: 400 }
    )
  }

  try {
    await execFileAsync(
      process.execPath,
      ['scripts/psn-sync.mjs', '--sync-supabase', '--out', 'exports/psn/latest-supabase-sync.json'],
      {
        cwd: process.cwd(),
        env: process.env,
        timeout: 180000,
        maxBuffer: 1024 * 1024 * 10,
      }
    )

    revalidatePath('/games')

    return NextResponse.json({
      message: '同步完成，列表已刷新。',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '同步失败'

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    )
  }
}
