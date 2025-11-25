'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackHandlerPage() {
  const router = useRouter()

  useEffect(() => {
    // Check for stored redirect in localStorage
    const redirect = localStorage.getItem('auth_redirect') || '/'

    // Clear the stored redirect
    if (redirect !== '/') {
      localStorage.removeItem('auth_redirect')
    }

    // Small delay to ensure auth session is fully established
    setTimeout(() => {
      router.push(redirect)
    }, 500)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto" />
        <p className="text-gray-600">Finalizando autenticação...</p>
      </div>
    </div>
  )
}
