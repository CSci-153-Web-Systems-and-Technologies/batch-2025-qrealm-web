
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getPublicEvents } from '@/lib/queries/events'
import DiscoverEventsClient from '@/app/(admin)/discover/discover-client'

export const metadata = {
  title: 'Discover Events | QRealm',
  description: 'Browse and explore all public events',
}

export default async function DiscoverPage() {
  // Auth check - only logged-in users can access
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Fetch all public events
  const events = await getPublicEvents()
  
  // Fetch event categories for filter dropdown
  const { data: categories } = await supabase
    .from('event_categories')
    .select('id, name')
    .order('name')
  
  return (
    <Suspense fallback={<DiscoverPageSkeleton />}>
      <DiscoverEventsClient 
        initialEvents={events}
        categories={categories || []}
        userId={user.id}
      />
    </Suspense>
  )
}

// Loading skeleton component
function DiscoverPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <div className="h-12 w-64 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-gray-200 rounded mx-auto animate-pulse" />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="h-10 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}