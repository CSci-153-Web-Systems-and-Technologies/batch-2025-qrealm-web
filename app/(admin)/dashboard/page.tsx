import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getDashboardStats, getUserEventsWithStats, getRecentUploads } from '@/lib/queries/dashboard'
import DashboardClient from './dashboard-client'

export const metadata = {
  title: 'Dashboard | QRealm',
  description: 'Manage your events and view statistics',
}

export default async function DashboardPage() {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Fetch dashboard data
  const [stats, events, recentUploads] = await Promise.all([
    getDashboardStats(user.id),
    getUserEventsWithStats(user.id),
    getRecentUploads(user.id, 5)
  ])
  
  return (
    <DashboardClient 
      user={user}
      stats={stats}
      events={events}
      recentUploads={recentUploads}
    />
  )
}