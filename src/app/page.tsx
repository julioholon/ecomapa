import EcoMap from '@/components/Map'

export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <h1 className="text-xl font-bold text-green-700">EcoMapa</h1>
        </div>
        <p className="hidden text-sm text-gray-600 sm:block">
          Mapeamento colaborativo de iniciativas regenerativas
        </p>
      </header>

      {/* Map */}
      <main className="relative flex-1">
        <EcoMap />
      </main>

      {/* Footer - minimal */}
      <footer className="border-t bg-white px-4 py-2 text-center text-xs text-gray-500">
        EcoMapa &copy; {new Date().getFullYear()} - Regen Crypto Commons
      </footer>
    </div>
  )
}
