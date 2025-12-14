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
  
  // Fetch user profile to get full_name
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  // Fetch dashboard data
  const [stats, events, recentUploads] = await Promise.all([
    getDashboardStats(user.id),
    getUserEventsWithStats(user.id),
    getRecentUploads(user.id, 5)
  ])
  
  return (
    <DashboardClient 
      user={{ ...user, full_name: profile?.full_name }}
      stats={stats}
      events={events}
      recentUploads={recentUploads}
    />
  )
}