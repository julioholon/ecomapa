import EcoMap from '@/components/Map'
import Header from '@/components/Layout/Header'

export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <Header />

      {/* Map - with top padding for header */}
      <main className="relative flex-1 pt-14">
        <EcoMap />
      </main>

      {/* Footer - minimal */}
      <footer className="border-t bg-white px-4 py-2 text-center text-xs text-gray-500">
        EcoMapa &copy; {new Date().getFullYear()} - Regen Crypto Commons
      </footer>
    </div>
  )
}
