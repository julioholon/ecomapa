'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

interface Donation {
  id: string
  amount: number
  status: string
  created_at: string
  payment_id: string | null
  ecopoint_id: string
}

interface EcopointWithDonations {
  id: string
  name: string
  total_received: number
  donations_count: number
  donations: Donation[]
}

export default function DoacoesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [ecopointsWithDonations, setEcopointsWithDonations] = useState<EcopointWithDonations[]>([])
  const [expandedEcopoint, setExpandedEcopoint] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDonations()
  }, [user])

  const fetchDonations = async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // First, get all ecopoints owned by the user
      const { data: ecopoints, error: ecopointsError } = await supabase
        .from('ecopoints')
        .select('id, name')
        .eq('owner_id', user.id)

      if (ecopointsError) throw ecopointsError

      if (!ecopoints || ecopoints.length === 0) {
        setEcopointsWithDonations([])
        setLoading(false)
        return
      }

      // Get all donations for these ecopoints
      const ecopointIds = (ecopoints as any[]).map((ep: any) => ep.id)
      const { data: donations, error: donationsError } = await supabase
        .from('donations')
        .select('*')
        .in('ecopoint_id', ecopointIds)
        .order('created_at', { ascending: false })

      if (donationsError) throw donationsError

      // Group donations by ecopoint
      const grouped = (ecopoints as any[]).map((ecopoint: any) => {
        const ecopointDonations = ((donations || []) as any[]).filter(
          (d: any) => d.ecopoint_id === ecopoint.id
        )

        const completedDonations = ecopointDonations.filter(
          (d: any) => d.status === 'completed'
        )

        const totalReceived = completedDonations.reduce(
          (sum: number, d: any) => sum + parseFloat(String(d.amount)),
          0
        )

        return {
          id: ecopoint.id,
          name: ecopoint.name,
          total_received: totalReceived,
          donations_count: completedDonations.length,
          donations: ecopointDonations,
        }
      })

      // Sort by total received (highest first)
      grouped.sort((a, b) => b.total_received - a.total_received)

      setEcopointsWithDonations(grouped)
    } catch (err: any) {
      console.error('Error fetching donations:', err)
      setError('Erro ao carregar doações. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
    }
    const labels = {
      completed: 'Concluída',
      pending: 'Pendente',
      failed: 'Falhou',
    }
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const totalAllEcopoints = ecopointsWithDonations.reduce(
    (sum, ep) => sum + ep.total_received,
    0
  )

  const totalDonationsCount = ecopointsWithDonations.reduce(
    (sum, ep) => sum + ep.donations_count,
    0
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto" />
          <p className="text-gray-600">Carregando doações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard/meus-pontos"
              className="flex items-center gap-2 text-green-600 hover:text-green-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Doações Recebidas</h1>
          </div>
          <p className="text-gray-600">
            Acompanhe as doações recebidas pelos seus ecopontos
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Recebido</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalAllEcopoints.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Doações Concluídas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalDonationsCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ecopontos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ecopointsWithDonations.filter((ep) => ep.donations_count > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ecopoints with Donations */}
        {ecopointsWithDonations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">💰</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Nenhum ecoponto cadastrado
            </h2>
            <p className="text-gray-600 mb-6">
              Cadastre ecopontos para começar a receber doações
            </p>
            <Link
              href="/dashboard/importar"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
            >
              Importar Ecoponto
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {ecopointsWithDonations.map((ecopoint) => (
              <div key={ecopoint.id} className="bg-white rounded-lg shadow">
                {/* Ecopoint Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    setExpandedEcopoint(
                      expandedEcopoint === ecopoint.id ? null : ecopoint.id
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {ecopoint.name}
                      </h3>
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-gray-600">Total recebido: </span>
                          <span className="font-bold text-green-600">
                            R$ {ecopoint.total_received.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Doações: </span>
                          <span className="font-bold text-gray-900">
                            {ecopoint.donations_count}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total transações: </span>
                          <span className="font-bold text-gray-900">
                            {ecopoint.donations.length}
                          </span>
                        </div>
                      </div>
                    </div>
                    <svg
                      className={`h-6 w-6 text-gray-400 transition-transform ${
                        expandedEcopoint === ecopoint.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Donations List */}
                {expandedEcopoint === ecopoint.id && (
                  <div className="border-t px-6 py-4">
                    {ecopoint.donations.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        Nenhuma doação recebida ainda
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Histórico de Transações
                        </h4>
                        {ecopoint.donations.map((donation) => (
                          <div
                            key={donation.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                {getStatusBadge(donation.status)}
                                <span className="text-sm text-gray-600">
                                  {new Date(donation.created_at).toLocaleString('pt-BR', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              {donation.payment_id && (
                                <p className="text-xs text-gray-500 font-mono">
                                  ID: {donation.payment_id}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                R$ {parseFloat(String(donation.amount)).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/dashboard/meus-pontos"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
          >
            Meus Ecopontos
          </Link>
          <Link
            href="/perfil"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
          >
            Meu Perfil
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Voltar ao Mapa
          </Link>
        </div>
      </div>
    </div>
  )
}
