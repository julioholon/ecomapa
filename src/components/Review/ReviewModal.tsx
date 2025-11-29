'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

interface ReviewModalProps {
  ecopoint: {
    id: string
    name: string
  }
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function ReviewModal({ ecopoint, isOpen, onClose, onSuccess }: ReviewModalProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [visited, setVisited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingReview, setExistingReview] = useState<any>(null)
  const [loadingExisting, setLoadingExisting] = useState(true)

  // Fetch existing review
  useEffect(() => {
    if (isOpen && user) {
      fetchExistingReview()
    }
  }, [isOpen, user, ecopoint.id])

  const fetchExistingReview = async () => {
    if (!user) return

    setLoadingExisting(true)
    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('rating, comment, visited')
        .eq('ecopoint_id', ecopoint.id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (data) {
        const reviewData = data as any
        setExistingReview(reviewData)
        setRating(reviewData.rating || 0)
        setComment(reviewData.comment || '')
        setVisited(reviewData.visited || false)
      }
    } catch (err: any) {
      console.error('Error fetching existing review:', err)
    } finally {
      setLoadingExisting(false)
    }
  }

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!user) {
      setError('Você precisa estar logado para avaliar')
      return
    }

    if (rating === 0) {
      setError('Por favor, selecione uma avaliação')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ecopoint_id: ecopoint.id,
          rating,
          comment: comment.trim() || null,
          visited,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao publicar avaliação')
      }

      // Success
      if (onSuccess) onSuccess()
      onClose()

      // Reset form
      setRating(0)
      setComment('')
      setVisited(false)
    } catch (err: any) {
      setError(err.message || 'Erro ao publicar avaliação')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const stars = [1, 2, 3, 4, 5]

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/50 p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gradient-to-r from-green-50 to-emerald-50 p-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {existingReview ? 'Editar Avaliação' : 'Avaliar Ecoponto'}
            </h2>
            <p className="text-sm text-gray-600">{ecopoint.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-white/50 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loadingExisting ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
              <p className="mt-2 text-sm text-gray-600">Carregando...</p>
            </div>
          ) : (
            <>
              {/* Star Rating */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Sua avaliação *
                </label>
                <div className="flex gap-2">
                  {stars.map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-4xl transition-transform hover:scale-110"
                    >
                      {star <= (hoverRating || rating) ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {rating === 1 && 'Muito insatisfeito'}
                    {rating === 2 && 'Insatisfeito'}
                    {rating === 3 && 'Neutro'}
                    {rating === 4 && 'Satisfeito'}
                    {rating === 5 && 'Muito satisfeito'}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label htmlFor="comment" className="mb-2 block text-sm font-medium text-gray-700">
                  Comentário (opcional)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="Compartilhe sua experiência com este ecoponto..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
                <p className="mt-1 text-right text-xs text-gray-500">
                  {comment.length}/500 caracteres
                </p>
              </div>

              {/* Visited Checkbox */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visited}
                    onChange={(e) => setVisited(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    ✓ Visitei este local
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || rating === 0}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Publicando...' : existingReview ? 'Atualizar' : 'Publicar Avaliação'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
