'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useGeolocation } from '@/hooks/useGeolocation'
import { searchNearbyPlaces } from '@/lib/google-places'

// Check API key availability at build time
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

// Debug: Log API key status (remove after testing)
console.log('Google Maps API Key configured:', !!GOOGLE_MAPS_API_KEY)

// Dynamic import for map component (SSR-safe)
const ImportMap = dynamic(() => import('@/components/Import/ImportMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto" />
        <p className="text-gray-600">Carregando mapa...</p>
      </div>
    </div>
  ),
})

export interface PlaceResult {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  rating?: number
  category: string[]
  imported: boolean
}

export default function ImportarPage() {
  const { user } = useAuth()
  const { latitude, longitude, getCurrentPosition } = useGeolocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<PlaceResult[]>([])
  const [importingId, setImportingId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Get user location on mount
  useEffect(() => {
    getCurrentPosition()
  }, [getCurrentPosition])

  // Search using Google Places API
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Digite algo para buscar')
      return
    }

    if (!latitude || !longitude) {
      setError('Ative sua localização primeiro')
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Check if API key is available
      if (!GOOGLE_MAPS_API_KEY) {
        throw new Error('API key not configured')
      }

      // Search using Google Places API
      const places = await searchNearbyPlaces(latitude, longitude, searchQuery, 5000)

      if (places.length === 0) {
        setError('Nenhum lugar encontrado. Tente outra busca.')
        setResults([])
        return
      }

      // Transform to our format
      const transformedResults: PlaceResult[] = places.map((place) => ({
        id: place.id,
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        rating: place.rating,
        category: [],
        imported: false,
      }))

      setResults(transformedResults)
    } catch (err) {
      console.error('Search error:', err)

      // Fallback to mock data if API fails
      if (err instanceof Error && err.message.includes('API key')) {
        setError('API do Google Maps não configurada. Usando dados de exemplo.')
        generateMockResults()
      } else {
        setError('Erro ao buscar lugares. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Fallback mock data generator
  const generateMockResults = () => {
    if (!latitude || !longitude) return

    const mockKeywords = ['Feira', 'Horta', 'ONG', 'Coletivo', 'Cooperativa', 'Instituto']
    const mockTypes = ['Orgânica', 'Comunitária', 'Verde', 'Sustentável', 'Ecológica']

    const numResults = 5 + Math.floor(Math.random() * 6)
    const mockResults: PlaceResult[] = []

    for (let i = 0; i < numResults; i++) {
      const keyword = mockKeywords[Math.floor(Math.random() * mockKeywords.length)]
      const type = mockTypes[Math.floor(Math.random() * mockTypes.length)]

      const offsetLat = (Math.random() - 0.5) * 0.09
      const offsetLng = (Math.random() - 0.5) * 0.09

      mockResults.push({
        id: `mock-${Date.now()}-${i}`,
        name: `${keyword} ${type} ${searchQuery}`,
        address: `Rua ${Math.floor(Math.random() * 1000)}, Bairro Centro`,
        lat: latitude + offsetLat,
        lng: longitude + offsetLng,
        rating: 3.5 + Math.random() * 1.5,
        category: [],
        imported: false,
      })
    }

    setResults(mockResults)
  }

  const handleCategoryChange = useCallback((id: string, category: string[]) => {
    setResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, category } : r))
    )
  }, [])

  const handleImportPlace = useCallback(async (place: PlaceResult) => {
    if (!place.category || place.category.length === 0) {
      setError('Selecione pelo menos uma categoria antes de importar')
      return
    }

    if (!user) {
      setError('Você precisa estar logado para importar')
      return
    }

    setImportingId(place.id)
    setError(null)

    try {
      const supabase = createClient()

      const insertData = {
        name: place.name,
        description: `Importado do Google Maps. Endereço: ${place.address}`,
        email: user.email || 'import@ecomapa.com',
        location: `POINT(${place.lng} ${place.lat})`,
        category: place.category,
        status: 'pending',
        imported_from: 'google_maps',
        imported_by: user.id,
      }

      console.log('Importing place:', insertData)

      const { data: insertedData, error: insertError } = await (supabase.from('ecopoints') as ReturnType<typeof supabase.from>)
        .insert(insertData as Record<string, unknown>)
        .select('id')
        .single()

      if (insertError) {
        console.error('Supabase insert error:', insertError)
        throw insertError
      }

      // Mark as imported
      setResults((prev) =>
        prev.map((r) => (r.id === place.id ? { ...r, imported: true } : r))
      )

      setSuccessMessage(`"${place.name}" importado com sucesso!`)

      // Send validation email in background (don't await, don't block UI)
      if (insertedData?.id && user.email) {
        fetch('/api/send-validation-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ecopointId: insertedData.id,
            ecopointName: place.name,
            ecopointAddress: place.address,
            ecopointEmail: user.email,
          }),
        })
          .then((res) => {
            if (res.ok) {
              console.log('Email de validação enviado para:', user.email)
            } else {
              console.warn('Falha ao enviar email de validação')
            }
          })
          .catch((err) => console.warn('Erro ao enviar email:', err))
      }

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Import error:', err)
      if (err instanceof Error) {
        setError(`Erro ao importar: ${err.message}`)
      } else {
        setError('Erro ao importar lugar')
      }
    } finally {
      setImportingId(null)
    }
  }, [user])

  const importedCount = results.filter((r) => r.imported).length

  // Memoize center to prevent map re-initialization
  const mapCenter = useMemo(() => {
    if (latitude && longitude) {
      return [latitude, longitude] as [number, number]
    }
    return null
  }, [latitude, longitude])

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              ← Voltar
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Importar do Google Maps</h1>
          </div>
          {importedCount > 0 && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              {importedCount} importado(s)
            </span>
          )}
        </header>

        {/* Search Bar */}
        <div className="bg-white px-4 py-3 shadow-sm">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar: feira orgânica, horta comunitária, ONG verde..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Buscando
                </span>
              ) : (
                '🔍 Buscar'
              )}
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              ✅ {successMessage}
            </div>
          )}
          {results.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {results.length} lugares encontrados. Clique em um pin para ver detalhes e importar.
            </p>
          )}
        </div>

        {/* Map */}
        <div className="relative flex-1">
          {mapCenter ? (
            <ImportMap
              center={mapCenter}
              places={results}
              onCategoryChange={handleCategoryChange}
              onImport={handleImportPlace}
              importingId={importingId}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100">
              <div className="text-center">
                <button
                  onClick={getCurrentPosition}
                  className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
                >
                  📍 Ativar Localização
                </button>
                <p className="mt-2 text-sm text-gray-600">
                  Precisamos da sua localização para mostrar o mapa
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
