'use client'

import { useAuthStore } from '@/stores/auth-store'
import { useEffect } from 'react'

export default function TestAuthStore() {
  const { user, isLoading, isInitialized, checkAuth } = useAuthStore()
  
  useEffect(() => {
    checkAuth()
  }, [checkAuth])
  
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-2">Auth Store Test</h3>
      <div className="text-sm">
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Initialized: {isInitialized ? 'Yes' : 'No'}</p>
        <p>User: {user ? user.email : 'Not logged in'}</p>
        <p>Role: {user?.role || 'N/A'}</p>
      </div>
    </div>
  )
}