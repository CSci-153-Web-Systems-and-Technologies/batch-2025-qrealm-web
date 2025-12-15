import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { rejectUpload } from '@/lib/queries/moderation'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { uploadId } = await request.json()
    if (!uploadId) {
      return NextResponse.json({ error: 'Upload ID is required' }, { status: 400 })
    }

    await rejectUpload(uploadId, user.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Moderation] Error rejecting upload:', error)

    const message = error?.message || 'Failed to reject upload'
    const status = message.includes('Unauthorized') ? 403
      : message.includes('blocked') ? 403
      : message.includes('not found') || message.includes('moderated') ? 404
      : 500

    return NextResponse.json({ error: message }, { status })
  }
}
