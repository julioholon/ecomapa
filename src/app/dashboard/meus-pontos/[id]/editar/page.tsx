'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_MAP } from '@/lib/constants/categories'

export default function EditarEcopontoPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

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
    fetchEcopoint()
  }, [user, id])

  const fetchEcopoint = async () => {
    if (!user?.id) return

    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('ecopoints')
        .select('*')
        .eq('id', id)
        .eq('owner_id', user.id) // Only allow editing own ecopoints
        .single()

      if (fetchError) throw fetchError

      if (!data) {
        setError('Ecoponto não encontrado ou você não tem permissão para editá-lo')
        setLoading(false)
        return
      }

      // Type assertion to help TypeScript
      const ecopoint = data as {
        name: string
        description: string
        category: string[]
        email: string
        phone?: string
        website?: string
        instagram?: string
        facebook?: string
        accepts_donations?: boolean
      }

      setFormData({
        name: ecopoint.name || '',
        description: ecopoint.description || '',
        category: ecopoint.category || [],
        email: ecopoint.email || '',
        phone: ecopoint.phone || '',
        website: ecopoint.website || '',
        instagram: ecopoint.instagram || '',
        facebook: ecopoint.facebook || '',
        acceptDonations: ecopoint.accepts_donations ?? true,
      })

      setLoading(false)
    } catch (err) {
      console.error('Error fetching ecopoint:', err)
      setError('Erro ao carregar ecoponto')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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

      // Update ecopoint
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
      }

      const { error: updateError } = await (supabase.from('ecopoints') as ReturnType<typeof supabase.from>)
        .update(updateData as Record<string, unknown>)
        .eq('id', id)
        .eq('owner_id', user!.id) // Extra safety check

      if (updateError) {
        throw updateError
      }

      // Success! Redirect back to list
      router.push('/dashboard/meus-pontos?updated=true')
    } catch (err) {
      console.error('Update error:', err)
      setError('Erro ao atualizar ecoponto. Tente novamente.')
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
          <p className="text-gray-600">Carregando ecoponto...</p>
        </div>
      </div>
    )
  }

  if (error && !formData.name) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4 text-5xl">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard/meus-pontos')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Voltar aos Meus Pontos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar Ecoponto</h1>
            <p className="text-gray-600">
              Atualize as informações do seu ecoponto
            </p>
          </div>

          {/* Form */}
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
                onClick={() => router.push('/dashboard/meus-pontos')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Salvando...' : '💾 Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
