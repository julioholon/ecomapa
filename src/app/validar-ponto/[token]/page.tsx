'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_MAP } from '@/lib/constants/categories'

export default function ValidarPontoPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ecopoint, setEcopoint] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: [] as string[],
    email: '',
    phone: '',
    website: '',
    instagram: '',
    facebook: '',
    acceptDonations: true,
  })

  useEffect(() => {
    async function validateToken() {
      try {
        // Verify token via API route
        const response = await fetch('/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (!response.ok || data.error) {
          setError(data.error || 'Erro ao validar token')
          setLoading(false)
          return
        }

        setEcopoint(data.ecopoint)

        // Pre-populate form with existing data
        setFormData({
          name: data.ecopoint.name || '',
          description: data.ecopoint.description || '',
          category: data.ecopoint.category || [],
          email: data.ecopoint.email || '',
          phone: data.ecopoint.phone || '',
          website: data.ecopoint.website || '',
          instagram: data.ecopoint.instagram || '',
          facebook: data.ecopoint.facebook || '',
          acceptDonations: true,
        })

        setLoading(false)
      } catch (err) {
        console.error('Validation error:', err)
        setError('Erro ao validar token')
        setLoading(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !ecopoint) return

    if (formData.category.length === 0) {
      setError('Selecione pelo menos uma categoria')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Digite um email válido')
        setSubmitting(false)
        return
      }

      // URL validation helper
      const isValidUrl = (url: string) => {
        if (!url) return true // Optional field
        try {
          new URL(url.startsWith('http') ? url : `https://${url}`)
          return true
        } catch {
          return false
        }
      }

      if (!isValidUrl(formData.website)) {
        setError('Website inválido')
        setSubmitting(false)
        return
      }

      // Update ecopoint with validated status
      const updateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        email: formData.email,
        phone: formData.phone || null,
        website: formData.website || null,
        instagram: formData.instagram || null,
        facebook: formData.facebook || null,
        accepts_donations: formData.acceptDonations,
        status: 'validated',
        validated_at: new Date().toISOString(),
        validated_by: user.id,
        owner_id: user.id,
      }

      const { error: updateError } = await (supabase.from('ecopoints') as ReturnType<typeof supabase.from>)
        .update(updateData as Record<string, unknown>)
        .eq('id', ecopoint.id)

      if (updateError) {
        throw updateError
      }

      // Success! Redirect to home with success message
      router.push('/?validated=true')
    } catch (err) {
      console.error('Validation submission error:', err)
      setError('Erro ao validar ecoponto. Tente novamente.')
      setSubmitting(false)
    }
  }

  const toggleCategory = (categoryKey: string) => {
    setFormData(prev => {
      const newCategories = prev.category.includes(categoryKey)
        ? prev.category.filter(c => c !== categoryKey)
        : [...prev.category, categoryKey]
      return { ...prev, category: newCategories }
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto" />
          <p className="text-gray-600">Verificando link de validação...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4 text-5xl">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro na Validação</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    )
  }

  if (!ecopoint) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🌱</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Validar Ecoponto</h1>
            <p className="text-gray-600">
              Confirme que este local pertence a você
            </p>
          </div>

          {/* Ecopoint Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              📍 {ecopoint.name}
            </h2>
            <p className="text-gray-600 mb-2">{ecopoint.description}</p>
            {ecopoint.address && (
              <p className="text-sm text-gray-500">
                {typeof ecopoint.address === 'string'
                  ? ecopoint.address
                  : JSON.stringify(ecopoint.address)}
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-2">O que acontece ao validar?</h3>
            <ul className="space-y-2 text-gray-600">
              <li>✅ Seu ponto aparecerá no mapa com badge "Validado"</li>
              <li>💰 Você poderá receber micro-doações via PIX e Cartão de crédito</li>
              <li>📸 Poderá adicionar fotos e informações completas</li>
              <li>⚙️ Terá acesso ao painel de gerenciamento</li>
            </ul>
          </div>

          {/* Form or CTA */}
          <div className="border-t pt-6">
            {user ? (
              showForm ? (
                // Validation Form
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Ecoponto *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={4}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      placeholder="Descreva seu ecoponto..."
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categorias * (primeira = principal)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(CATEGORY_MAP).map(([key, cat]) => (
                        <label
                          key={key}
                          className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={formData.category.includes(key)}
                            onChange={() => toggleCategory(key)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm">
                            {cat.icon} {cat.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email de contato *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone (opcional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website (opcional)
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      placeholder="https://seusite.com"
                    />
                  </div>

                  {/* Social Media */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instagram
                      </label>
                      <input
                        type="text"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        placeholder="@seuinsta"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Facebook
                      </label>
                      <input
                        type="text"
                        value={formData.facebook}
                        onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        placeholder="facebook.com/sua-página"
                      />
                    </div>
                  </div>

                  {/* Accept Donations */}
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="acceptDonations"
                      checked={formData.acceptDonations}
                      onChange={(e) => setFormData({ ...formData, acceptDonations: e.target.checked })}
                      className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="acceptDonations" className="text-sm text-gray-700">
                      <strong>Aceito receber micro-doações</strong>
                      <p className="text-gray-600 mt-1">
                        Visitantes do mapa poderão apoiar seu ecoponto com doações espontâneas
                      </p>
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {submitting ? 'Validando...' : '✅ Validar e Publicar'}
                    </button>
                  </div>
                </form>
              ) : (
                // Preview / Continue button
                <>
                  <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4">
                    <p className="text-sm text-green-800">
                      ✅ Você está logado como <strong>{user.email}</strong>
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Pronto! Agora você pode prosseguir com a validação do seu ecoponto.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
                  >
                    Continuar Validação
                  </button>
                </>
              )
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Para continuar, você precisa estar logado ou criar uma conta.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/login?redirect=/validar-ponto/${token}`)}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
                  >
                    Fazer Login
                  </button>
                  <button
                    onClick={() => router.push(`/cadastro?redirect=/validar-ponto/${token}`)}
                    className="flex-1 bg-white text-green-600 px-6 py-3 rounded-lg font-medium border-2 border-green-600 hover:bg-green-50"
                  >
                    Criar Conta
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Not your business? */}
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-gray-600">
              Não é seu negócio?{' '}
              <button className="text-green-600 hover:underline">
                Reportar erro
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
