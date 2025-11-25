import { NextRequest, NextResponse } from 'next/server'
import { verifyValidationToken } from '@/lib/tokens'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 })
    }

    // Verify token
    const tokenData = verifyValidationToken(token)

    if (!tokenData) {
      return NextResponse.json({ error: 'Link de validação inválido ou expirado' }, { status: 400 })
    }

    // Fetch ecopoint data
    const supabase = await createClient()
    const { data: ecopoint, error: fetchError } = await supabase
      .from('ecopoints')
      .select('*')
      .eq('id', tokenData.ecopointId)
      .single()

    if (fetchError || !ecopoint) {
      return NextResponse.json({ error: 'Ecoponto não encontrado' }, { status: 404 })
    }

    // Check if already validated
    if ((ecopoint as { status: string }).status === 'validated') {
      return NextResponse.json({ error: 'Este ecoponto já foi validado' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      ecopoint,
      tokenData,
    })
  } catch (err) {
    console.error('Token verification error:', err)
    return NextResponse.json({ error: 'Erro ao verificar token' }, { status: 500 })
  }
}
