'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { verifyValidationToken } from '@/lib/tokens'
import { createClient } from '@/lib/supabase/client'

export default function ValidarPontoPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ecopoint, setEcopoint] = useState<any>(null)

  useEffect(() => {
    async function validateToken() {
      try {
        // Verify token
        const tokenData = verifyValidationToken(token)

        if (!tokenData) {
          setError('Link de validação inválido ou expirado')
          setLoading(false)
          return
        }

        // Fetch ecopoint data
        const supabase = createClient()
        const response = await supabase
          .from('ecopoints')
          .select('*')
          .eq('id', tokenData.ecopointId)
          .single()

        const data = response.data as any
        const fetchError = response.error

        if (fetchError || !data) {
          setError('Ecoponto não encontrado')
          setLoading(false)
          return
        }

        // Check if already validated
        if (data.status === 'validated') {
          setError('Este ecoponto já foi validado')
          setLoading(false)
          return
        }

        setEcopoint(data)
        setLoading(false)
      } catch (err) {
        console.error('Validation error:', err)
        setError('Erro ao validar token')
        setLoading(false)
      }
    }

    validateToken()
  }, [token])

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
              <li>💰 Você poderá receber micro-doações via PIX</li>
              <li>📸 Poderá adicionar fotos e informações completas</li>
              <li>⚙️ Terá acesso ao painel de gerenciamento</li>
            </ul>
          </div>

          {/* CTA */}
          <div className="border-t pt-6">
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
