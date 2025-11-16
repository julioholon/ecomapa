'use client'

import dynamic from 'next/dynamic'

const EcoMap = dynamic(() => import('./EcoMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
        <p className="text-gray-600">Carregando mapa...</p>
      </div>
    </div>
  ),
})

export default EcoMap
