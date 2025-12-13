import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

export function useStoreInitialization() {
  const { checkAuth, isInitialized } = useAuthStore()
  
  useEffect(() => {
    if (!isInitialized) {
      checkAuth()
    }
  }, [checkAuth, isInitialized])
}