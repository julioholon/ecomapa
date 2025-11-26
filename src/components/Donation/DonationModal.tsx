'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface DonationModalProps {
  ecopoint: {
    id: string
    name: string
    description: string | null
  }
  isOpen: boolean
  onClose: () => void
}

const SUGGESTED_AMOUNTS = [5, 10, 20] // Reais
const MIN_AMOUNT = 2
const MAX_AMOUNT = 1000

export default function DonationModal({ ecopoint, isOpen, onClose }: DonationModalProps) {
  const { user } = useAuth()
  const [amount, setAmount] = useState(10)
  const [customAmount, setCustomAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'qrcode' | 'success'>('select')
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [pixCode, setPixCode] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(300) // 5 minutes

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Reset after animation
      setTimeout(() => {
        setStep('select')
        setAmount(10)
        setCustomAmount('')
        setError(null)
        setPaymentIntentId(null)
        setQrCodeUrl(null)
        setPixCode(null)
        setExpiresAt(null)
        setTimeLeft(300)
      }, 300)
    }
  }, [isOpen])

  // Poll payment status
  useEffect(() => {
    if (!paymentIntentId || step !== 'qrcode') return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment-status/${paymentIntentId}`)
        const data = await response.json()

        if (data.status === 'succeeded' || data.status === 'completed') {
          setStep('success')
          clearInterval(interval)
        }
      } catch (err) {
        console.error('Error polling payment status:', err)
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [paymentIntentId, step])

  // Countdown timer
  useEffect(() => {
    if (step !== 'qrcode' || !expiresAt) return

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      const remaining = expiresAt - now

      if (remaining <= 0) {
        setError('QR Code expirou. Por favor, tente novamente.')
        setStep('select')
        clearInterval(interval)
      } else {
        setTimeLeft(remaining)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [step, expiresAt])

  const handleAmountChange = (value: number) => {
    setAmount(value)
    setCustomAmount('')
    setError(null)
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= MIN_AMOUNT) {
      setAmount(numValue)
      setError(null)
    }
  }

  const handleCreatePayment = async () => {
    if (!user) {
      setError('Você precisa estar logado para fazer uma doação')
      return
    }

    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      setError(`Valor deve estar entre R$ ${MIN_AMOUNT} e R$ ${MAX_AMOUNT}`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          ecopointId: ecopoint.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar pagamento')
      }

      setPaymentIntentId(data.paymentIntentId)

      // Get QR Code details
      const statusResponse = await fetch(`/api/payment-status/${data.paymentIntentId}`)
      const statusData = await statusResponse.json()

      if (statusData.pixDetails) {
        setQrCodeUrl(statusData.pixDetails.qrCode)
        setPixCode(statusData.pixDetails.pixCode)
        setExpiresAt(statusData.pixDetails.expiresAt)
        setStep('qrcode')
      } else {
        throw new Error('QR Code PIX não disponível')
      }
    } catch (err: unknown) {
      console.error('Error creating payment:', err)
      setError(err instanceof Error ? err.message : 'Erro ao criar pagamento')
    } finally {
      setLoading(false)
    }
  }

  const copyPixCode = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode)
      alert('Código PIX copiado!')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* Step 1: Select Amount */}
        {step === 'select' && (
          <>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Apoiar este ecoponto</h2>
            <p className="mb-6 text-sm text-gray-600">{ecopoint.name}</p>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Escolha um valor
              </label>
              <div className="grid grid-cols-3 gap-3">
                {SUGGESTED_AMOUNTS.map((value) => (
                  <button
                    key={value}
                    onClick={() => handleAmountChange(value)}
                    className={`rounded-lg border-2 py-3 font-medium transition-colors ${
                      amount === value && !customAmount
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-300 text-gray-700 hover:border-green-300'
                    }`}
                  >
                    R$ {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Ou digite um valor personalizado
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  step="0.01"
                  placeholder={`Mínimo ${MIN_AMOUNT}`}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <button
              onClick={handleCreatePayment}
              disabled={loading}
              className="w-full rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Gerando QR Code...' : `Gerar QR Code PIX - R$ ${amount.toFixed(2)}`}
            </button>

            <p className="mt-4 text-center text-xs text-gray-500">
              Pagamento seguro via Stripe PIX
            </p>
          </>
        )}

        {/* Step 2: QR Code */}
        {step === 'qrcode' && (
          <>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Escaneie o QR Code</h2>
            <p className="mb-4 text-sm text-gray-600">Use seu app de banco para pagar</p>

            <div className="mb-4 rounded-lg bg-gray-100 p-4 text-center">
              {qrCodeUrl ? (
                <iframe
                  src={qrCodeUrl}
                  title="QR Code PIX"
                  className="mx-auto h-64 w-64 rounded border"
                />
              ) : (
                <div className="h-64 w-64 mx-auto flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Ou copie o código PIX
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pixCode || ''}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs"
                />
                <button
                  onClick={copyPixCode}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Copiar
                </button>
              </div>
            </div>

            <div className="mb-4 rounded-lg bg-yellow-50 p-3 text-center">
              <p className="text-sm font-medium text-yellow-800">
                ⏱️ Expira em: {formatTime(timeLeft)}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Aguardando confirmação do pagamento...
              </p>
            </div>

            <button
              onClick={() => setStep('select')}
              className="w-full rounded-lg border-2 border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="text-center">
            <div className="mb-4 text-6xl">🎉</div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Doação confirmada!</h2>
            <p className="mb-6 text-gray-600">
              Obrigado por apoiar <strong>{ecopoint.name}</strong> com R$ {amount.toFixed(2)}!
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-700"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
