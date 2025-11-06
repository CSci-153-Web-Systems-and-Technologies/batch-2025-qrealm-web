'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, isInitialized, checkAuth } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isInitialized) {
      checkAuth()
    }
  }, [isInitialized, checkAuth])

  useEffect(() => {
    if (!isLoading && isInitialized && !user) {
      console.log('Access denied - redirecting to login')
      router.push('/login') 
    }
  }, [user, isLoading, isInitialized, router])

  
  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        <span className="ml-2 text-brand-50">Checking access...</span>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}