import { NextRequest, NextResponse } from 'next/server'
import { resend, EMAIL_FROM, SITE_URL } from '@/lib/resend/client'
import { createClient } from '@/lib/supabase/server'
import { DonationReceivedEmail } from '@/lib/resend/templates/DonationReceivedEmail'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { donation_id } = body

    if (!donation_id) {
      return NextResponse.json(
        { success: false, message: 'donation_id is required' },
        { status: 400 }
      )
    }

    // Check if Resend is configured
    if (!resend) {
      console.error('Resend not configured. Cannot send email.')
      return NextResponse.json(
        {
          success: false,
          message: 'RESEND_API_KEY not found',
          emailSent: false,
        },
        { status: 500 }
      )
    }

    // Get donation details with ecopoint and owner info
    const supabase = await createClient()
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .select(`
        id,
        amount,
        ecopoint_id,
        user_id,
        ecopoints (
          id,
          name,
          owner_id,
          users:owner_id (
            id,
            email,
            raw_user_meta_data
          )
        )
      `)
      .eq('id', donation_id)
      .single()

    if (donationError || !donation) {
      console.error('Error fetching donation:', donationError)
      return NextResponse.json(
        { success: false, message: 'Donation not found' },
        { status: 404 }
      )
    }

    // Type assertion to handle Supabase's nested query types
    const donationData = donation as any
    const ecopoint = donationData.ecopoints
    const owner = ecopoint?.users

    if (!owner?.email) {
      console.error('No owner email found for ecopoint')
      return NextResponse.json(
        { success: false, message: 'Owner email not found' },
        { status: 404 }
      )
    }

    // Get donor name (optional)
    let donorName: string | undefined
    if (donationData.user_id) {
      const { data: donor } = await supabase
        .from('users')
        .select('raw_user_meta_data')
        .eq('id', donationData.user_id)
        .single()

      if (donor) {
        donorName = (donor as any).raw_user_meta_data?.full_name || 'Anônimo'
      }
    }

    // Get total stats for this ecopoint
    const { data: stats } = await supabase
      .from('donations')
      .select('amount')
      .eq('ecopoint_id', ecopoint.id)
      .eq('status', 'completed')

    const totalReceived = (stats || []).reduce(
      (sum, d: any) => sum + parseFloat(d.amount),
      0
    )
    const donationsCount = (stats || []).length

    // Send email
    const dashboardUrl = `${SITE_URL}/dashboard/doacoes`

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: owner.email,
      subject: `💰 Você recebeu uma doação de R$ ${parseFloat(donationData.amount).toFixed(2)}!`,
      react: DonationReceivedEmail({
        ecopointName: ecopoint.name,
        amount: parseFloat(donationData.amount),
        donorName,
        totalReceived,
        donationsCount,
        dashboardUrl,
      }) as any,
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send email',
          error: emailError,
        },
        { status: 500 }
      )
    }

    console.log('✅ Donation email sent successfully:', emailData?.id)

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: emailData?.id,
    })
  } catch (error: any) {
    console.error('Error sending donation email:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
