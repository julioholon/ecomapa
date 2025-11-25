import { NextRequest, NextResponse } from 'next/server'
import { resend, EMAIL_FROM, SITE_URL } from '@/lib/resend/client'
import { generateValidationToken } from '@/lib/tokens'
import { ValidationInviteEmail } from '@/lib/resend/templates/ValidationInviteEmail'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { ecopointId, ecopointName, ecopointAddress, ecopointEmail } = body

    // Validate required fields
    if (!ecopointId || !ecopointName || !ecopointEmail) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando: ecopointId, ecopointName, ecopointEmail' },
        { status: 400 }
      )
    }

    // Verify ecopoint exists and was imported by this user
    const { data: ecopoint, error: fetchError } = await supabase
      .from('ecopoints')
      .select('id, name, status, imported_by')
      .eq('id', ecopointId)
      .single()

    if (fetchError || !ecopoint) {
      return NextResponse.json({ error: 'Ecoponto não encontrado' }, { status: 404 })
    }

    // Check if user has permission (is the importer or admin)
    if ((ecopoint as { imported_by: string | null }).imported_by !== user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para enviar email para este ecoponto' },
        { status: 403 }
      )
    }

    // Check if already validated
    if ((ecopoint as { status: string }).status === 'validated') {
      return NextResponse.json(
        { error: 'Ecoponto já validado' },
        { status: 400 }
      )
    }

    // Check if Resend is configured
    if (!resend) {
      console.error('Resend não configurado. Não é possível enviar email.')
      return NextResponse.json(
        {
          error: 'Serviço de email não configurado',
          message: 'RESEND_API_KEY não encontrada',
        },
        { status: 500 }
      )
    }

    // Generate validation token
    const token = generateValidationToken(ecopointId, ecopointEmail)
    const validationUrl = `${SITE_URL}/validar-ponto/${token}`

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: ecopointEmail,
      subject: `${ecopointName} foi adicionado ao EcoMapa! 🌱`,
      react: ValidationInviteEmail({
        ecopointName,
        ecopointAddress: ecopointAddress || 'Endereço não disponível',
        validationUrl,
      }) as React.ReactElement,
    })

    if (emailError) {
      console.error('Erro do Resend:', emailError)
      return NextResponse.json(
        { error: 'Falha ao enviar email', details: emailError },
        { status: 500 }
      )
    }

    // Log email sent (optional: save to database)
    console.log('Email de validação enviado:', {
      ecopointId,
      ecopointName,
      email: ecopointEmail,
      emailId: emailData?.id,
    })

    // Update ecopoint with email_sent flag
    await (supabase.from('ecopoints') as ReturnType<typeof supabase.from>)
      .update({
        validation_email_sent: true,
        validation_email_sent_at: new Date().toISOString(),
      } as Record<string, unknown>)
      .eq('id', ecopointId)

    return NextResponse.json({
      success: true,
      message: 'Email de validação enviado com sucesso',
      emailId: emailData?.id,
    })
  } catch (error) {
    console.error('Erro ao enviar email de validação:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
