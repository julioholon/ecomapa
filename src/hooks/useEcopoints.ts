'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface EcopointLocation {
  id: string
  name: string
  description: string | null
  email: string
  category: string[]
  status: string
  lat: number
  lng: number
}

interface EcopointRow {
  id: string
  name: string
  description: string | null
  email: string
  category: string[]
  status: string
  location: unknown
}

interface EcopointRPCRow {
  id: string
  name: string
  description: string | null
  email: string
  category: string[]
  status: string
  location_text: string
}

interface UseEcopointsReturn {
  ecopoints: EcopointLocation[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useEcopoints(): UseEcopointsReturn {
  const [ecopoints, setEcopoints] = useState<EcopointLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEcopoints = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Use raw SQL to get location as text via ST_AsText
      const { data, error: queryError } = await supabase.rpc('get_ecopoints_with_location')

      if (queryError) {
        // Fallback to direct query if RPC doesn't exist
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('ecopoints')
          .select('id, name, description, email, category, status, location')
          .in('status', ['validated', 'pending'])
          .order('created_at', { ascending: false })

        if (fallbackError) throw fallbackError

        // Parse the binary format - need to create RPC function
        console.warn('RPC function not found, using fallback. Location data may not parse correctly.')

        // If fallback, we need to handle the raw data
        const parsedFromFallback: EcopointLocation[] = ((fallbackData || []) as EcopointRow[]).map((point) => {
          let lat = 0
          let lng = 0

          if (point.location) {
            const locationStr = String(point.location)
            const match = locationStr.match(/POINT\(([^ ]+) ([^)]+)\)/)
            if (match) {
              lng = parseFloat(match[1])
              lat = parseFloat(match[2])
            }
          }

          return {
            id: point.id,
            name: point.name,
            description: point.description,
            email: point.email,
            category: point.category,
            status: point.status,
            lat,
            lng,
          }
        })

        setEcopoints(parsedFromFallback)
        return
      }

      // Parse PostGIS geography to lat/lng from RPC response
      const parsedPoints: EcopointLocation[] = ((data || []) as EcopointRPCRow[]).map((point) => {
        // RPC returns location_text as "POINT(lng lat)"
        let lat = 0
        let lng = 0

        if (point.location_text) {
          // Try to parse POINT format from ST_AsText output
          const match = point.location_text.match(/POINT\(([^ ]+) ([^)]+)\)/)
          if (match) {
            lng = parseFloat(match[1])
            lat = parseFloat(match[2])
          }
        }

        return {
          id: point.id,
          name: point.name,
          description: point.description,
          email: point.email,
          category: point.category,
          status: point.status,
          lat,
          lng,
        }
      })

      setEcopoints(parsedPoints)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar ecopontos'
      setError(message)
      console.error('Error fetching ecopoints:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEcopoints()
  }, [])

  return {
    ecopoints,
    loading,
    error,
    refetch: fetchEcopoints,
  }
}
