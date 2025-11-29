'use client'

import { useEffect, useState } from 'react'
import { EcopointLocation } from '@/hooks/useEcopoints'
import { getPrimaryCategory, CATEGORY_MAP } from '@/lib/constants/categories'
import DonationModal from '@/components/Donation/DonationModal'
import ReviewModal from '@/components/Review/ReviewModal'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

interface DetailModalProps {
  ecopoint: EcopointLocation | null
  onClose: () => void
}

export default function DetailModal({ ecopoint, onClose }: DetailModalProps) {
  const { user } = useAuth()
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(true)

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (ecopoint) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [ecopoint])

  // Fetch reviews
  useEffect(() => {
    if (ecopoint) {
      fetchReviews()
    }
  }, [ecopoint])

  const fetchReviews = async () => {
    if (!ecopoint) return

    setLoadingReviews(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          visited,
          created_at,
          user:user_id (
            full_name,
            email
          )
        `)
        .eq('ecopoint_id', ecopoint.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching reviews:', error)
      } else {
        setReviews((data as any) || [])
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
    } finally {
      setLoadingReviews(false)
    }
  }

  const handleReviewSuccess = () => {
    fetchReviews()
  }

  if (!ecopoint) return null

  const primaryCat = getPrimaryCategory(ecopoint.category)
  const otherCategories = ecopoint.category.slice(1).map((catSlug) => ({
    slug: catSlug,
    ...CATEGORY_MAP[catSlug]
  })).filter((cat) => cat.name)

  const handleGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${ecopoint.lat},${ecopoint.lng}`
    window.open(url, '_blank')
  }

  const handleShare = async () => {
    const shareData = {
      title: ecopoint.name,
      text: `Confira ${ecopoint.name} no EcoMapa!`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copiado!')
    }
  }

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
              style={{ backgroundColor: primaryCat.color + '30' }}
            >
              {primaryCat.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{ecopoint.name}</h2>
              <p className="text-sm text-gray-600">{primaryCat.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Badge */}
          <div className="mb-6">
            {ecopoint.status === 'validated' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Validado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Pendente de validação
              </span>
            )}
          </div>

          {/* Description */}
          {ecopoint.description && (
            <div className="mb-6">
              <h3 className="mb-2 font-semibold text-gray-900">Sobre</h3>
              <p className="text-gray-700 leading-relaxed">{ecopoint.description}</p>
            </div>
          )}

          {/* Other Categories */}
          {otherCategories.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 font-semibold text-gray-900">Outras categorias</h3>
              <div className="flex flex-wrap gap-2">
                {otherCategories.map((cat) => (
                  <span
                    key={cat.slug}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm"
                    style={{ backgroundColor: cat.color + '20', color: cat.color }}
                  >
                    {cat.icon} {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Address */}
          {ecopoint.address && (
            <div className="mb-6">
              <h3 className="mb-2 font-semibold text-gray-900">Endereço</h3>
              <p className="text-gray-700">
                {(() => {
                  try {
                    // Sempre tenta parsear se for string (vem serializado do banco)
                    const addr = typeof ecopoint.address === 'string'
                      ? JSON.parse(ecopoint.address)
                      : ecopoint.address

                    const parts = [
                      addr.street,
                      addr.city,
                      addr.state
                    ].filter(Boolean)

                    return parts.join(', ')
                  } catch {
                    // Se falhar o parse, retorna a string original
                    return String(ecopoint.address)
                  }
                })()}
              </p>
            </div>
          )}

          {/* Contact Info */}
          {(ecopoint.email || ecopoint.phone || ecopoint.website) && (
            <div className="mb-6">
              <h3 className="mb-2 font-semibold text-gray-900">Contato</h3>
              <div className="space-y-2">
                {ecopoint.email && (
                  <a
                    href={`mailto:${ecopoint.email}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {ecopoint.email}
                  </a>
                )}
                {ecopoint.phone && (
                  <a
                    href={`tel:${ecopoint.phone}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {ecopoint.phone}
                  </a>
                )}
                {ecopoint.website && (
                  <a
                    href={ecopoint.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                    {ecopoint.website}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Social Media */}
          {(ecopoint.instagram || ecopoint.facebook) && (
            <div className="mb-6">
              <h3 className="mb-2 font-semibold text-gray-900">Redes Sociais</h3>
              <div className="flex gap-3">
                {ecopoint.instagram && (
                  <a
                    href={`https://instagram.com/${ecopoint.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-white hover:opacity-90"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    Instagram
                  </a>
                )}
                {ecopoint.facebook && (
                  <a
                    href={ecopoint.facebook.startsWith('http') ? ecopoint.facebook : `https://facebook.com/${ecopoint.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Coordinates */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold text-gray-900">Coordenadas</h3>
            <p className="font-mono text-sm text-gray-600">
              {ecopoint.lat.toFixed(6)}, {ecopoint.lng.toFixed(6)}
            </p>
          </div>

          {/* Reviews Section */}
          {ecopoint.status === 'validated' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Avaliações</h3>
                {(ecopoint as any).rating_count > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <span className="text-lg font-bold text-gray-900">
                      {((ecopoint as any).rating_avg || 0).toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({(ecopoint as any).rating_count} {(ecopoint as any).rating_count === 1 ? 'avaliação' : 'avaliações'})
                    </span>
                  </div>
                )}
              </div>

              {loadingReviews ? (
                <div className="py-8 text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-3 border-gray-200 border-t-green-600"></div>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className="text-lg">
                                {star <= review.rating ? '⭐' : '☆'}
                              </span>
                            ))}
                          </div>
                          {review.visited && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                              ✓ Visitado
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {review.comment && (
                        <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                      )}

                      <p className="text-xs text-gray-500">
                        Por {review.user?.full_name || review.user?.email?.split('@')[0] || 'Anônimo'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                  <p className="text-sm text-gray-600">
                    Ainda não há avaliações para este ecoponto.
                    {user && ' Seja o primeiro a avaliar!'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleGoogleMaps}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Como Chegar
            </button>

            <button
              onClick={handleShare}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Compartilhar
            </button>

            {ecopoint.status === 'validated' && user && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                ⭐ Avaliar
              </button>
            )}

            {ecopoint.status === 'validated' && ecopoint.accepts_donations && (
              <button
                onClick={() => setShowDonationModal(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                💰 Apoiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <DonationModal
        ecopoint={{
          id: ecopoint.id,
          name: ecopoint.name,
          description: ecopoint.description,
        }}
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
      />

      {/* Review Modal */}
      <ReviewModal
        ecopoint={{
          id: ecopoint.id,
          name: ecopoint.name,
        }}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSuccess={handleReviewSuccess}
      />
    </div>
  )
}
