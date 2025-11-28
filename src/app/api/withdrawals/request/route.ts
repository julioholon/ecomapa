import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import WithdrawalRequestOwnerEmail from '@/lib/resend/templates/WithdrawalRequestOwnerEmail'
import WithdrawalRequestAdminEmail from '@/lib/resend/templates/WithdrawalRequestAdminEmail'

const resend = new Resend(process.env.RESEND_API_KEY!)
const EMAIL_FROM = process.env.EMAIL_FROM || 'EcoMapa <noreply@ecomapa.com.br>'
const ADMIN_EMAIL = process.env.EMAIL_FROM || 'admin@ecomapa.com.br'

// Platform fee percentage
const PLATFORM_FEE_PERCENTAGE = 0.1 // 10%

// Minimum withdrawal amount
const MIN_WITHDRAWAL_AMOUNT = 10.0 // R$ 10.00

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { ecopoint_id, amount_gross, pix_key, pix_key_type } = body

    // Validate required fields
    if (!ecopoint_id || !amount_gross || !pix_key || !pix_key_type) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate amount
    const amountGross = parseFloat(amount_gross)
    if (isNaN(amountGross) || amountGross < MIN_WITHDRAWAL_AMOUNT) {
      return NextResponse.json(
        {
          success: false,
          message: `Valor mínimo para saque é R$ ${MIN_WITHDRAWAL_AMOUNT.toFixed(2)}`,
        },
        { status: 400 }
      )
    }

    // Validate PIX key type
    const validPixKeyTypes = ['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM']
    if (!validPixKeyTypes.includes(pix_key_type)) {
      return NextResponse.json(
        { success: false, message: 'Tipo de chave PIX inválido' },
        { status: 400 }
      )
    }

    // Check if user is the owner of the ecopoint
    const { data: ecopoint, error: ecopointError } = await supabase
      .from('ecopoints')
      .select('id, name, owner_id')
      .eq('id', ecopoint_id)
      .single()

    if (ecopointError || !ecopoint) {
      return NextResponse.json(
        { success: false, message: 'Ecoponto não encontrado' },
        { status: 404 }
      )
    }

    // Type assertion for Supabase data
    const ecopointData = ecopoint as any

    if (ecopointData.owner_id !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Você não é o proprietário deste ecoponto' },
        { status: 403 }
      )
    }

    // Check if there's already a pending withdrawal
    const { data: existingWithdrawal } = await supabase
      .from('withdrawals')
      .select('id')
      .eq('ecopoint_id', ecopoint_id)
      .in('status', ['pending', 'processing'])
      .maybeSingle()

    if (existingWithdrawal) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Já existe uma solicitação de saque pendente para este ecoponto',
        },
        { status: 400 }
      )
    }

    // Get available balance
    const { data: balanceData, error: balanceError } = await (
      supabase.rpc as any
    )('get_available_balance', { p_ecopoint_id: ecopoint_id })

    if (balanceError) {
      console.error('Error getting balance:', balanceError)
      return NextResponse.json(
        { success: false, message: 'Erro ao calcular saldo disponível' },
        { status: 500 }
      )
    }

    const availableBalance = parseFloat(balanceData)

    if (isNaN(availableBalance) || availableBalance < amountGross) {
      return NextResponse.json(
        {
          success: false,
          message: `Saldo insuficiente. Disponível: R$ ${availableBalance.toFixed(2)}`,
        },
        { status: 400 }
      )
    }

    // Validate PIX key format
    const { data: isValidPix, error: pixValidationError } = await (
      supabase.rpc as any
    )('validate_pix_key', {
      p_pix_key: pix_key,
      p_pix_key_type: pix_key_type,
    })

    if (pixValidationError) {
      console.error('Error validating PIX:', pixValidationError)
      return NextResponse.json(
        { success: false, message: 'Erro ao validar chave PIX' },
        { status: 500 }
      )
    }

    if (!isValidPix) {
      return NextResponse.json(
        {
          success: false,
          message: `Chave PIX inválida para o tipo ${pix_key_type}`,
        },
        { status: 400 }
      )
    }

    // Calculate fees
    const platformFee = amountGross * PLATFORM_FEE_PERCENTAGE
    const amountNet = amountGross - platformFee

    // Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await (
      supabase.from('withdrawals') as any
    )
      .insert({
        ecopoint_id,
        user_id: user.id,
        amount_gross: amountGross,
        platform_fee: platformFee,
        amount_net: amountNet,
        pix_key,
        pix_key_type,
        status: 'pending',
      })
      .select('id, created_at')
      .single()

    if (withdrawalError) {
      console.error('Error creating withdrawal:', withdrawalError)
      return NextResponse.json(
        { success: false, message: 'Erro ao criar solicitação de saque' },
        { status: 500 }
      )
    }

    // Type assertion for withdrawal data
    const withdrawalData = withdrawal as any

    // Get user data for emails
    const { data: userData } = await supabase
      .from('users')
      .select('email, raw_user_meta_data')
      .eq('id', user.id)
      .single()

    const userDataTyped = userData as any
    const ownerName = userDataTyped?.raw_user_meta_data?.full_name || 'Usuário'
    const ownerEmail = userDataTyped?.email || user.email

    // Format date
    const requestedAt = new Date(withdrawalData.created_at).toLocaleString(
      'pt-BR',
      {
        dateStyle: 'short',
        timeStyle: 'short',
      }
    )

    // Send email to owner
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: ownerEmail,
        subject: `💸 Saque de R$ ${amountNet.toFixed(2)} solicitado com sucesso`,
        react: WithdrawalRequestOwnerEmail({
          ecopointName: ecopointData.name,
          amountGross,
          platformFee,
          amountNet,
          pixKey: pix_key,
          pixKeyType: pix_key_type,
        }) as any,
      })

      console.log('✅ Owner withdrawal notification email sent')
    } catch (emailError) {
      console.error('Error sending owner email:', emailError)
      // Don't fail the request if email fails
    }

    // Send email to admin
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: ADMIN_EMAIL,
        subject: `🚨 AÇÃO NECESSÁRIA: Novo saque de R$ ${amountNet.toFixed(2)} - ${ecopointData.name}`,
        react: WithdrawalRequestAdminEmail({
          withdrawalId: withdrawalData.id,
          ecopointName: ecopointData.name,
          ecopointId: ecopoint_id,
          ownerName,
          ownerEmail,
          amountGross,
          platformFee,
          amountNet,
          pixKey: pix_key,
          pixKeyType: pix_key_type,
          requestedAt,
        }) as any,
      })

      console.log('✅ Admin withdrawal notification email sent')
    } catch (emailError) {
      console.error('Error sending admin email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitação de saque criada com sucesso',
      data: {
        withdrawal_id: withdrawalData.id,
        amount_gross: amountGross,
        platform_fee: platformFee,
        amount_net: amountNet,
        status: 'pending',
      },
    })
  } catch (error: any) {
    console.error('Error processing withdrawal request:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno ao processar solicitação',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch withdrawal history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get ecopoint_id from query params
    const { searchParams } = new URL(request.url)
    const ecopointId = searchParams.get('ecopoint_id')

    let query = supabase
      .from('withdrawals')
      .select(
        `
        id,
        amount_gross,
        platform_fee,
        amount_net,
        pix_key,
        pix_key_type,
        status,
        created_at,
        processed_at,
        ecopoints (
          id,
          name
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (ecopointId) {
      query = query.eq('ecopoint_id', ecopointId)
    }

    const { data: withdrawals, error: withdrawalsError } = await query

    if (withdrawalsError) {
      console.error('Error fetching withdrawals:', withdrawalsError)
      return NextResponse.json(
        { success: false, message: 'Erro ao buscar histórico de saques' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: withdrawals || [],
    })
  } catch (error: any) {
    console.error('Error fetching withdrawal history:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno ao buscar histórico',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
