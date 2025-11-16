'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/supabase/types'

export default function TestDBPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>(
    'checking'
  )

  useEffect(() => {
    async function testConnection() {
      const supabase = createClient()

      try {
        // Test 1: Basic connection
        const { data, error } = await supabase.from('categories').select('*').order('name')

        if (error) {
          throw error
        }

        setCategories(data || [])
        setConnectionStatus('connected')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        setConnectionStatus('error')
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Teste de Conexão Supabase</h1>

        {/* Connection Status */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Status da Conexão</h2>
          <div className="flex items-center gap-3">
            {connectionStatus === 'checking' && (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                <span>Verificando conexão...</span>
              </>
            )}
            {connectionStatus === 'connected' && (
              <>
                <div className="h-4 w-4 rounded-full bg-green-500" />
                <span className="text-green-700">Conectado ao Supabase!</span>
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <div className="h-4 w-4 rounded-full bg-red-500" />
                <span className="text-red-700">Erro na conexão</span>
              </>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-6 text-red-700">
            <h3 className="mb-2 font-semibold">Erro:</h3>
            <pre className="whitespace-pre-wrap text-sm">{error}</pre>
            <div className="mt-4 text-sm">
              <p className="font-medium">Possíveis causas:</p>
              <ul className="mt-2 list-inside list-disc">
                <li>Variáveis de ambiente não configuradas em .env.local</li>
                <li>Migrations não executadas no Supabase</li>
                <li>RLS bloqueando acesso (verifique as policies)</li>
                <li>URL ou chave do Supabase incorretas</li>
              </ul>
            </div>
          </div>
        )}

        {/* Categories List */}
        {!loading && categories.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">
              Categorias Carregadas ({categories.length})
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 rounded-lg border p-4"
                  style={{ borderLeftColor: cat.color, borderLeftWidth: '4px' }}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-sm text-gray-500">{cat.slug}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && !error && (
          <div className="rounded-lg bg-yellow-50 p-6 text-yellow-700">
            <p>Nenhuma categoria encontrada. Execute a migration 003_seed_categories.sql</p>
          </div>
        )}

        {/* Environment Check */}
        <div className="mt-6 rounded-lg bg-gray-100 p-6">
          <h2 className="mb-4 text-xl font-semibold">Checklist</h2>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!process.env.NEXT_PUBLIC_SUPABASE_URL}
                readOnly
                className="h-4 w-4"
              />
              <span>NEXT_PUBLIC_SUPABASE_URL configurada</span>
            </li>
            <li className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}
                readOnly
                className="h-4 w-4"
              />
              <span>NEXT_PUBLIC_SUPABASE_ANON_KEY configurada</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" checked={connectionStatus === 'connected'} readOnly className="h-4 w-4" />
              <span>Conexão com banco estabelecida</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" checked={categories.length === 8} readOnly className="h-4 w-4" />
              <span>8 categorias carregadas</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
