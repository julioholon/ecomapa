'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

interface Donation {
  id: string
  amount: number
  status: string
  created_at: string
  ecopoint: {
    name: string
  }
}

export default function PerfilPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [name, setName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/perfil')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || '')
      fetchDonations()
    }
  }, [user])

  const fetchDonations = async () => {
    if (!user?.id) return

    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('donations')
        .select(`
          id,
          amount,
          status,
          created_at,
          ecopoint:ecopoints(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (fetchError) throw fetchError

      setDonations(data as any || [])
    } catch (err: any) {
      console.error('Error fetching donations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateName = async () => {
    if (!user || !name.trim()) return

    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: name,
        },
      })

      if (updateError) throw updateError

      setSuccess('Nome atualizado com sucesso!')
      setEditing(false)
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar nome')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user) return

    setError(null)
    setSuccess(null)

    if (newPassword.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      setSuccess('Senha alterada com sucesso!')
      setChangingPassword(false)
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const totalDonated = donations
    .filter((d) => d.status === 'completed')
    .reduce((sum, d) => sum + parseFloat(String(d.amount)), 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-green-600 hover:text-green-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao mapa
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Profile Section */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Info Card */}
            <div className="rounded-xl bg-white p-6 shadow">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-600">
                  {name.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {name || 'Sem nome'}
                  </h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>

              {/* Edit Name Section */}
              <div className="border-t pt-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Informações Pessoais</h3>

                {!editing ? (
                  <div>
                    <div className="mb-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Nome completo
                      </label>
                      <p className="text-gray-900">{name || 'Não informado'}</p>
                    </div>
                    <button
                      onClick={() => setEditing(true)}
                      className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                      Editar nome
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                        Nome completo
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateName}
                        disabled={loading}
                        className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false)
                          setName(user.user_metadata?.full_name || '')
                        }}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Change Password Section */}
              <div className="border-t pt-6 mt-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Segurança</h3>

                {!changingPassword ? (
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Alterar senha
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-gray-700">
                        Nova senha
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        placeholder="Mínimo 8 caracteres"
                        minLength={8}
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
                        Confirmar nova senha
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        placeholder="Repita a senha"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading ? 'Alterando...' : 'Alterar senha'}
                      </button>
                      <button
                        onClick={() => {
                          setChangingPassword(false)
                          setNewPassword('')
                          setConfirmPassword('')
                        }}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Donations History Card */}
            <div className="rounded-xl bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Histórico de Doações</h3>

              {donations.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Você ainda não fez nenhuma doação
                </p>
              ) : (
                <div className="space-y-3">
                  {donations.map((donation) => (
                    <div
                      key={donation.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {donation.ecopoint?.name || 'Ecoponto removido'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(donation.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          R$ {parseFloat(String(donation.amount)).toFixed(2)}
                        </p>
                        <p className={`text-sm ${
                          donation.status === 'completed' ? 'text-green-600' :
                          donation.status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {donation.status === 'completed' ? 'Concluída' :
                           donation.status === 'pending' ? 'Pendente' :
                           'Falhou'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="rounded-xl bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Estatísticas</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total doado</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {totalDonated.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Doações realizadas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {donations.filter((d) => d.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="rounded-xl bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Links Rápidos</h3>
              <div className="space-y-2">
                <Link
                  href="/dashboard/meus-pontos"
                  className="block rounded-lg border border-gray-200 p-3 text-gray-700 hover:bg-gray-50"
                >
                  Meus Ecopontos
                </Link>
                <Link
                  href="/dashboard/importar"
                  className="block rounded-lg border border-gray-200 p-3 text-gray-700 hover:bg-gray-50"
                >
                  Importar Ponto
                </Link>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full rounded-lg border border-red-300 bg-white px-4 py-3 font-medium text-red-600 hover:bg-red-50"
            >
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
