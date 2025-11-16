'use client'

interface LocationButtonProps {
  onClick: () => void
  loading: boolean
  hasLocation: boolean
}

export default function LocationButton({ onClick, loading, hasLocation }: LocationButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-lg bg-white px-4 py-2
        shadow-md transition-all hover:bg-gray-50 disabled:cursor-wait disabled:opacity-70
        ${hasLocation ? 'ring-2 ring-green-500' : ''}
      `}
      title="Centralizar na minha localização"
    >
      {loading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-5 w-5 ${hasLocation ? 'text-green-600' : 'text-gray-600'}`}
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
        </svg>
      )}
      <span className="text-sm font-medium">
        {loading ? 'Localizando...' : hasLocation ? 'Localizado' : 'Minha Localização'}
      </span>
    </button>
  )
}
