
// Export all stores for easy imports
export { useAuthStore } from './auth-store'
export { useEventStore } from './event-store'
export { useUploadStore } from './upload-store'

// Optional: Create a hook that combines multiple stores if needed
import { useAuthStore } from './auth-store'
import { useEventStore } from './event-store'
import { useUploadStore } from './upload-store'

export const useAppStores = () => {
  const auth = useAuthStore()
  const events = useEventStore()
  const uploads = useUploadStore()
  
  return {
    auth,
    events,
    uploads,
    // Add computed properties or combined actions here
    isAdmin: () => auth.user?.role === 'admin' || auth.user?.role === 'super_admin'
  }
}