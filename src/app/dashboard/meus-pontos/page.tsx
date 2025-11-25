'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_MAP } from '@/lib/constants/categories'

interface Ecopoint {
  id: string
  name: string
  description: string
  category: string[]
  status: 'pending' | 'validated' | 'rejected'
  email: string
  phone?: string
  website?: string
  instagram?: string
  facebook?: string
  accepts_donations: boolean
  created_at: string
  validated_at?: string
}

export default function MeusPontosPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [ecopoints, setEcopoints] = useState<Ecopoint[]>([])
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/dashboard/meus-pontos')
      return
    }

    fetchEcopoints()
  }, [user, router])

  const fetchEcopoints = async () => {
    if (!user?.id) return

    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('ecopoints')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setEcopoints(data || [])
    } catch (err) {
      console.error('Error fetching ecopoints:', err)
      setError('Erro ao carregar seus ecopontos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!user?.id) return

    const confirmed = confirm(
      `Tem certeza que deseja excluir "${name}"?\n\nEsta ação não pode ser desfeita.`
    )

    if (!confirmed) return

    setDeletingId(id)
    setError(null)

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('ecopoints')
        .delete()
        .eq('id', id)
        .eq('owner_id', user.id) // Extra safety check

      if (deleteError) throw deleteError

      // Remove from local state
      setEcopoints(prev => prev.filter(ep => ep.id !== id))

      // Show success message briefly
      alert('Ecoponto excluído com sucesso!')
    } catch (err) {
      console.error('Error deleting ecopoint:', err)
      setError('Erro ao excluir ecoponto. Tente novamente.')
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      validated: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
    }
    const labels = {
      validated: 'Validado',
      pending: 'Pendente',
      rejected: 'Rejeitado',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto" />
          <p className="text-gray-600">Carregando seus ecopontos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Meus Ecopontos</h1>
            <button
              onClick={() => router.push('/dashboard/importar')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
            >
              + Importar Novo
            </button>
          </div>
          <p className="text-gray-600">
            Gerencie os ecopontos que você administra
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Ecopoints Grid */}
        {ecopoints.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">🌱</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Nenhum ecoponto ainda
            </h2>
            <p className="text-gray-600 mb-6">
              Comece importando locais do Google Maps
            </p>
            <button
              onClick={() => router.push('/dashboard/importar')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
            >
              Importar Primeiro Ecoponto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ecopoints.map((ecopoint) => {
              const primaryCategory = ecopoint.category[0]
              const categoryData = primaryCategory ? CATEGORY_MAP[primaryCategory] : null

              return (
                <div
                  key={ecopoint.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-3xl mb-2">
                        {categoryData?.icon || '📍'}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {ecopoint.name}
                      </h3>
                    </div>
                    {getStatusBadge(ecopoint.status)}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {ecopoint.description}
                  </p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {ecopoint.category.slice(0, 3).map((catKey) => {
                      const cat = CATEGORY_MAP[catKey]
                      return cat ? (
                        <span
                          key={catKey}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {cat.icon} {cat.name}
                        </span>
                      ) : null
                    })}
                    {ecopoint.category.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        +{ecopoint.category.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="text-xs text-gray-500 mb-4 space-y-1">
                    <div>Criado: {new Date(ecopoint.created_at).toLocaleDateString('pt-BR')}</div>
                    {ecopoint.validated_at && (
                      <div>Validado: {new Date(ecopoint.validated_at).toLocaleDateString('pt-BR')}</div>
                    )}
                    {ecopoint.accepts_donations && (
                      <div className="text-green-600 font-medium">💰 Aceita doações</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => router.push(`/dashboard/meus-pontos/${ecopoint.id}/editar`)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(ecopoint.id, ecopoint.name)}
                      disabled={deletingId === ecopoint.id}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      {deletingId === ecopoint.id ? '⏳' : '🗑️'} Excluir
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Back to home */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← Voltar ao Mapa
          </button>
        </div>
      </div>
    </div>
  )
}
