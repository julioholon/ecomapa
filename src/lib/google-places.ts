'use client'

// Google Maps script loader
let googleMapsPromise: Promise<typeof google> | null = null

export function loadGoogleMapsScript(): Promise<typeof google> {
  if (googleMapsPromise) {
    return googleMapsPromise
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key not configured'))
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof google !== 'undefined' && google.maps) {
      resolve(google)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      if (typeof google !== 'undefined' && google.maps) {
        resolve(google)
      } else {
        reject(new Error('Google Maps failed to load'))
      }
    }

    script.onerror = () => {
      googleMapsPromise = null
      reject(new Error('Failed to load Google Maps script'))
    }

    document.head.appendChild(script)
  })

  return googleMapsPromise
}

export interface PlaceSearchResult {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  rating?: number
  types?: string[]
}

export async function searchNearbyPlaces(
  lat: number,
  lng: number,
  query: string,
  radiusMeters: number = 5000
): Promise<PlaceSearchResult[]> {
  const google = await loadGoogleMapsScript()

  return new Promise((resolve, reject) => {
    // Create a temporary div for the PlacesService (required by Google)
    const mapDiv = document.createElement('div')
    const map = new google.maps.Map(mapDiv, {
      center: { lat, lng },
      zoom: 14,
    })

    const service = new google.maps.places.PlacesService(map)

    const request: google.maps.places.TextSearchRequest = {
      query: query,
      location: new google.maps.LatLng(lat, lng),
      radius: radiusMeters,
    }

    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const places: PlaceSearchResult[] = results
          .filter((place) => place.geometry?.location)
          .map((place) => ({
            id: place.place_id || `place-${Date.now()}-${Math.random()}`,
            name: place.name || 'Local sem nome',
            address: place.formatted_address || 'Endereço não disponível',
            lat: place.geometry!.location!.lat(),
            lng: place.geometry!.location!.lng(),
            rating: place.rating,
            types: place.types,
          }))

        resolve(places)
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        resolve([])
      } else {
        reject(new Error(`Places API error: ${status}`))
      }
    })
  })
}
