import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { approveUpload } from '@/lib/queries/moderation'

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

    await approveUpload(uploadId, user.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Moderation] Error approving upload:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to approve upload' },
      { status: 500 }
    )
  }
}
