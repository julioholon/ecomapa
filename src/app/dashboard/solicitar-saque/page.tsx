'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

interface Ecopoint {
  id: string
  name: string
  available_balance: number
}

interface Withdrawal {
  id: string
  amount_gross: number
  platform_fee: number
  amount_net: number
  pix_key: string
  pix_key_type: string
  status: string
  created_at: string
  processed_at: string | null
  ecopoints: {
    id: string
    name: string
  }
}

const PIX_KEY_TYPES = [
  { value: 'CPF', label: 'CPF' },
  { value: 'CNPJ', label: 'CNPJ' },
  { value: 'EMAIL', label: 'E-mail' },
  { value: 'PHONE', label: 'Telefone (celular)' },
  { value: 'RANDOM', label: 'Chave aleatória' },
]

const PLATFORM_FEE_PERCENTAGE = 0.1 // 10%
const MIN_WITHDRAWAL_AMOUNT = 10.0 // R$ 10.00

export default function SolicitarSaquePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [ecopoints, setEcopoints] = useState<Ecopoint[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [selectedEcopoint, setSelectedEcopoint] = useState<string>('')
  const [amountGross, setAmountGross] = useState<string>('')
  const [pixKeyType, setPixKeyType] = useState<string>('CPF')
  const [pixKey, setPixKey] = useState<string>('')
  const [confirmedPixKey, setConfirmedPixKey] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Fetch user's ecopoints
      const { data: ecopointsData, error: ecopointsError } = await supabase
        .from('ecopoints')
        .select('id, name')
        .eq('owner_id', user.id)

      if (ecopointsError) throw ecopointsError

      // For each ecopoint, get available balance
      const ecopointsWithBalance = await Promise.all(
        ((ecopointsData as any[]) || []).map(async (ecopoint: any) => {
          const { data: balance } = await (supabase.rpc as any)(
            'get_available_balance',
            {
              p_ecopoint_id: ecopoint.id,
            }
          )

          return {
            id: ecopoint.id,
            name: ecopoint.name,
            available_balance: parseFloat(balance || 0),
          }
        })
      )

      setEcopoints(ecopointsWithBalance)

      // Fetch withdrawal history
      const response = await fetch('/api/withdrawals/request')
      const data = await response.json()

      if (data.success) {
        setWithdrawals(data.data)
      }
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    // Validations
    if (!selectedEcopoint) {
      setError('Selecione um ecoponto')
      return
    }

    const amount = parseFloat(amountGross)
    if (isNaN(amount) || amount < MIN_WITHDRAWAL_AMOUNT) {
      setError(`Valor mínimo para saque é R$ ${MIN_WITHDRAWAL_AMOUNT.toFixed(2)}`)
      return
    }

    const selectedEcopointData = ecopoints.find(
      (ep) => ep.id === selectedEcopoint
    )
    if (!selectedEcopointData) {
      setError('Ecoponto não encontrado')
      return
    }

    if (amount > selectedEcopointData.available_balance) {
      setError(
        `Saldo insuficiente. Disponível: R$ ${selectedEcopointData.available_balance.toFixed(2)}`
      )
      return
    }

    if (!pixKey.trim()) {
      setError('Informe a chave PIX')
      return
    }

    if (!confirmedPixKey) {
      setError('Confirme que a chave PIX está correta')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/withdrawals/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ecopoint_id: selectedEcopoint,
          amount_gross: amount,
          pix_key: pixKey.trim(),
          pix_key_type: pixKeyType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao solicitar saque')
      }

      setSuccessMessage(
        `Saque de R$ ${data.data.amount_net.toFixed(2)} solicitado com sucesso! Você receberá um email com os detalhes.`
      )

      // Reset form
      setSelectedEcopoint('')
      setAmountGross('')
      setPixKey('')
      setConfirmedPixKey(false)

      // Refresh data
      await fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const calculateFees = () => {
    const amount = parseFloat(amountGross)
    if (isNaN(amount)) return null

    const platformFee = amount * PLATFORM_FEE_PERCENTAGE
    const amountNet = amount - platformFee

    return {
      platformFee,
      amountNet,
    }
  }

  const fees = calculateFees()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto" />
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (ecopoints.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para o mapa
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            💸 Solicitar Saque
          </h1>

          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-xl text-gray-600 mb-6">
              Você ainda não possui ecopontos validados.
            </p>
            <p className="text-gray-500 mb-8">
              Para solicitar saques, você precisa ter pelo menos um ecoponto
              validado que recebeu doações.
            </p>
            <Link
              href="/dashboard/meus-pontos"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Ver Meus Ecopontos
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para o mapa
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💸 Solicitar Saque
          </h1>
          <p className="text-gray-600">
            Solicite o saque das doações recebidas em seus ecopontos
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-3">
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-3">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Withdrawal Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Nova Solicitação de Saque
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Ecopoint Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecione o Ecoponto
                  </label>
                  <select
                    value={selectedEcopoint}
                    onChange={(e) => setSelectedEcopoint(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um ecoponto...</option>
                    {ecopoints.map((ecopoint) => (
                      <option key={ecopoint.id} value={ecopoint.id}>
                        {ecopoint.name} - Saldo: R${' '}
                        {ecopoint.available_balance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor a Sacar (mínimo R$ {MIN_WITHDRAWAL_AMOUNT.toFixed(2)}
                    )
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min={MIN_WITHDRAWAL_AMOUNT}
                      value={amountGross}
                      onChange={(e) => setAmountGross(e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  {selectedEcopoint && (
                    <p className="mt-1 text-sm text-gray-500">
                      Saldo disponível: R${' '}
                      {ecopoints
                        .find((ep) => ep.id === selectedEcopoint)
                        ?.available_balance.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Fee Breakdown */}
                {fees && fees.amountNet > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">
                      Resumo do Saque
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor solicitado:</span>
                        <span className="font-medium">
                          R$ {parseFloat(amountGross).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Taxa da plataforma (10%):
                        </span>
                        <span className="font-medium text-orange-600">
                          - R$ {fees.platformFee.toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-green-300 pt-2 flex justify-between">
                        <span className="font-bold text-gray-900">
                          Você receberá:
                        </span>
                        <span className="font-bold text-green-600 text-lg">
                          R$ {fees.amountNet.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* PIX Key Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Chave PIX
                  </label>
                  <select
                    value={pixKeyType}
                    onChange={(e) => {
                      setPixKeyType(e.target.value)
                      setPixKey('') // Reset PIX key when type changes
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    {PIX_KEY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PIX Key Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chave PIX
                  </label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder={getPixKeyPlaceholder(pixKeyType)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {getPixKeyHint(pixKeyType)}
                  </p>
                </div>

                {/* Confirmation Checkbox */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmedPixKey}
                      onChange={(e) => setConfirmedPixKey(e.target.checked)}
                      className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      required
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      <strong>Confirmo que a chave PIX está correta.</strong> O
                      pagamento será enviado para a chave informada acima e não
                      poderá ser revertido.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting || !confirmedPixKey}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Processando...' : 'Solicitar Saque'}
                  </button>
                  <Link
                    href="/dashboard/doacoes"
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 text-center"
                  >
                    Cancelar
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Available Balances */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                💰 Saldos Disponíveis
              </h3>
              <div className="space-y-3">
                {ecopoints.map((ecopoint) => (
                  <div
                    key={ecopoint.id}
                    className="flex justify-between items-center pb-3 border-b border-gray-200 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {ecopoint.name}
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        R$ {ecopoint.available_balance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-blue-900 mb-3">ℹ️ Informações</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Valor mínimo: R$ {MIN_WITHDRAWAL_AMOUNT.toFixed(2)}</li>
                <li>• Taxa da plataforma: 10%</li>
                <li>• Prazo: 24 a 48 horas úteis</li>
                <li>• Pagamento via PIX</li>
                <li>• 1 saque por vez por ecoponto</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Withdrawal History */}
        {withdrawals.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              📋 Histórico de Saques
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Data
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Ecoponto
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Valor Bruto
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Taxa
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Valor Líquido
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Chave PIX
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal) => (
                    <tr
                      key={withdrawal.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(withdrawal.created_at).toLocaleDateString(
                          'pt-BR'
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {withdrawal.ecopoints.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        R$ {withdrawal.amount_gross.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-orange-600">
                        R$ {withdrawal.platform_fee.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-green-600">
                        R$ {withdrawal.amount_net.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                        {maskPixKey(withdrawal.pix_key, withdrawal.pix_key_type)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(
                            withdrawal.status
                          )}`}
                        >
                          {getStatusLabel(withdrawal.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions
function getPixKeyPlaceholder(type: string): string {
  switch (type) {
    case 'CPF':
      return '12345678901'
    case 'CNPJ':
      return '12345678000190'
    case 'EMAIL':
      return 'seuemail@exemplo.com'
    case 'PHONE':
      return '11987654321'
    case 'RANDOM':
      return '12345678-1234-1234-1234-123456789012'
    default:
      return ''
  }
}

function getPixKeyHint(type: string): string {
  switch (type) {
    case 'CPF':
      return 'Digite apenas os 11 números do CPF (sem pontos ou traços)'
    case 'CNPJ':
      return 'Digite apenas os 14 números do CNPJ (sem pontos ou traços)'
    case 'EMAIL':
      return 'Digite o email cadastrado como chave PIX'
    case 'PHONE':
      return 'Digite o celular com DDD (apenas números, ex: 11987654321)'
    case 'RANDOM':
      return 'Digite a chave aleatória completa (formato UUID)'
    default:
      return ''
  }
}

function maskPixKey(key: string, type: string): string {
  if (type === 'CPF' || type === 'CNPJ') {
    // Show only last 4 digits
    return `***${key.slice(-4)}`
  }
  if (type === 'EMAIL') {
    const [user, domain] = key.split('@')
    return `${user.substring(0, 3)}***@${domain}`
  }
  if (type === 'PHONE') {
    return `***${key.slice(-4)}`
  }
  return key // Random keys can be shown
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pendente'
    case 'processing':
      return 'Processando'
    case 'completed':
      return 'Concluído'
    case 'rejected':
      return 'Rejeitado'
    default:
      return status
  }
}

function getStatusStyles(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'processing':
      return 'bg-blue-100 text-blue-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
