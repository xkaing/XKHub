import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type TokenRow = {
  access_token: string | null
  refresh_token: string | null
  access_token_expires_at: string | null
  refresh_token_expires_at: string | null
  updated_at: string | null
}

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({
      configured: false,
      hasAccessToken: false,
      hasRefreshToken: false,
      accessToken: null,
      refreshToken: null,
      updatedAt: null,
    })
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase
    .from('psn_auth_tokens')
    .select('access_token, refresh_token, access_token_expires_at, refresh_token_expires_at, updated_at')
    .order('updated_at', { ascending: false, nullsFirst: false })
    .limit(1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const token = (data?.[0] ?? null) as TokenRow | null

  return NextResponse.json({
    configured: true,
    hasAccessToken: Boolean(token?.access_token),
    hasRefreshToken: Boolean(token?.refresh_token),
    accessToken: buildTokenStatus(token?.access_token_expires_at ?? null),
    refreshToken: buildTokenStatus(token?.refresh_token_expires_at ?? null),
    updatedAt: token?.updated_at ?? null,
  })
}

function buildTokenStatus(expiresAt: string | null) {
  if (!expiresAt) {
    return {
      expiresAt: null,
      isExpired: true,
      secondsRemaining: 0,
    }
  }

  const secondsRemaining = Math.max(0, Math.floor((Date.parse(expiresAt) - Date.now()) / 1000))

  return {
    expiresAt,
    isExpired: secondsRemaining <= 0,
    secondsRemaining,
  }
}
