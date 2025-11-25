'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function Header() {
  const { user, loading, signOut } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setShowMenu(false)
  }

  return (
    <header className="absolute left-0 right-0 top-0 z-[1500] flex items-center justify-between bg-white/90 px-4 py-3 backdrop-blur-sm shadow-sm">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl">🌱</span>
        <span className="text-xl font-bold text-green-600">EcoMapa</span>
      </Link>

      <div className="flex items-center gap-3">
        {loading ? (
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
        ) : user ? (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              <span className="hidden sm:inline">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg bg-white py-2 shadow-lg">
                  <div className="border-b px-4 py-2">
                    <p className="text-sm font-medium text-gray-900">
                      {user.user_metadata?.full_name || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard/importar"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    📥 Importar do Google Maps
                  </Link>
                  <Link
                    href="/perfil"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    Meu Perfil
                  </Link>
                  <Link
                    href="/dashboard/meus-pontos"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    Meus Pontos
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Entrar
          </Link>
        )}
      </div>
    </header>
  )
}
