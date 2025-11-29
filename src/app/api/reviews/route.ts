import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { message: 'Você precisa estar autenticado para avaliar' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { ecopoint_id, rating, comment, visited } = body

    // Validate input
    if (!ecopoint_id || !rating) {
      return NextResponse.json(
        { message: 'Ecoponto e avaliação são obrigatórios' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Avaliação deve ser entre 1 e 5' },
        { status: 400 }
      )
    }

    // Check if ecopoint exists and is validated
    const { data: ecopoint, error: ecopointError } = await supabase
      .from('ecopoints')
      .select('id, status')
      .eq('id', ecopoint_id)
      .single()

    if (ecopointError || !ecopoint) {
      return NextResponse.json(
        { message: 'Ecoponto não encontrado' },
        { status: 404 }
      )
    }

    if (ecopoint.status !== 'validated') {
      return NextResponse.json(
        { message: 'Apenas ecopontos validados podem receber avaliações' },
        { status: 400 }
      )
    }

    // Check if user already reviewed this ecopoint
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('ecopoint_id', ecopoint_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingReview) {
      // Update existing review
      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          rating,
          comment: comment?.trim() || null,
          visited: visited || false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingReview.id)

      if (updateError) {
        console.error('Error updating review:', updateError)
        return NextResponse.json(
          { message: 'Erro ao atualizar avaliação' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Avaliação atualizada com sucesso!',
        review: { id: existingReview.id },
      })
    } else {
      // Insert new review
      const { data: newReview, error: insertError } = await supabase
        .from('reviews')
        .insert({
          ecopoint_id,
          user_id: user.id,
          rating,
          comment: comment?.trim() || null,
          visited: visited || false,
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Error creating review:', insertError)
        return NextResponse.json(
          { message: 'Erro ao criar avaliação' },
          { status: 500 }
        )
      }

      // Update user reputation (+5 points, +1 review)
      const { error: reputationError } = await supabase.rpc(
        'increment_user_reputation',
        {
          p_user_id: user.id,
          p_points: 5,
          p_donation_increment: 0,
          p_review_increment: 1,
        }
      )

      if (reputationError) {
        console.error('Error updating reputation:', reputationError)
        // Don't fail the request, just log the error
      }

      return NextResponse.json({
        message: 'Avaliação publicada com sucesso! +5 pontos de reputação',
        review: newReview,
      })
    }
  } catch (error) {
    console.error('Error in review API:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
