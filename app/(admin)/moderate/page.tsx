
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getModerationStats, getUserEventPendingUploads } from '@/lib/queries/moderation'
import ModerateClient from './moderate-client'

export const metadata = {
  title: 'Moderate Photos | QRealm',
  description: 'Review and approve pending photo uploads for your events.',
}

export default async function ModeratePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [pendingUploads, stats] = await Promise.all([
    getUserEventPendingUploads(user.id),
    getModerationStats(user.id),
  ])

  return (
    <ModerateClient
      initialUploads={pendingUploads}
      stats={stats}
    />
  )
}