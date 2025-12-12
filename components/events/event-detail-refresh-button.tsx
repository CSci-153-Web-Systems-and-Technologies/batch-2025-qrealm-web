'use client'

import { Button } from '@/components/ui/button'

export function EventDetailRefreshButton() {
  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <Button onClick={handleRefresh} className="mt-2">
      Refresh Page
    </Button>
  )
}
