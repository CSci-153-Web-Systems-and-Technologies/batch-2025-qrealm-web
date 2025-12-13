// lib/queries/reactions.ts
import { createClient } from '@/utils/supabase/client'
import { getClientIP } from '@/lib/ip-utils'

export type ReactionType = 'heart' | 'sparkle' | 'like' | 'love'

export interface ReactionResponse {
  action: 'added' | 'removed'
  reaction_type: ReactionType
  count: number
  has_reacted: boolean
}

/**
 * Toggle a reaction on a photo (like/unlike)
 */
export async function togglePhotoReaction(
  uploadId: string,
  reactionType: ReactionType = 'heart'
): Promise<ReactionResponse | null> {
  const supabase = createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get IP address for guest users
  const ipAddress = !user ? await getClientIP() : null
  
  try {
    const { data, error } = await (supabase.rpc as any)('toggle_photo_reaction', {
      upload_uuid: uploadId,
      user_uuid: user?.id || null,
      ip_addr: ipAddress,
      react_type: reactionType
    })
    
    if (error) {
      console.error('Error toggling reaction:', error)
      return null
    }
    
    return data as ReactionResponse
  } catch (error) {
    console.error('Error toggling reaction:', error)
    return null
  }
}

/**
 * Get reaction counts for multiple uploads
 */
export async function getReactionCounts(uploadIds: string[]) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('photo_reactions')
      .select('upload_id, reaction_type')
      .in('upload_id', uploadIds)
    
    if (error) {
      console.error('Error fetching reaction counts:', error)
      return {}
    }
    
    // Group by upload_id and reaction_type
    const counts: Record<string, Record<string, number>> = {} as Record<string, Record<string, number>>
    
    (data as any)?.forEach((reaction: any) => {
      if (!counts[reaction.upload_id]) {
        counts[reaction.upload_id] = { heart: 0, sparkle: 0 }
      }
      if (!counts[reaction.upload_id][reaction.reaction_type]) {
        counts[reaction.upload_id][reaction.reaction_type] = 0
      }
      counts[reaction.upload_id][reaction.reaction_type]++
    })
    
    return counts
  } catch (error) {
    console.error('Error fetching reaction counts:', error)
    return {}
  }
}

/**
 * Check if current user has reacted to uploads
 */
export async function getUserReactions(uploadIds: string[]) {
  const supabase = createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get IP address for guest users
  const ipAddress = !user ? await getClientIP() : null
  
  if (!user && !ipAddress) {
    return {}
  }
  
  try {
    let query = supabase
      .from('photo_reactions')
      .select('upload_id, reaction_type')
      .in('upload_id', uploadIds)
    
    if (user) {
      query = query.eq('user_id', user.id)
    } else if (ipAddress) {
      query = query.eq('ip_address', ipAddress)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching user reactions:', error)
      return {}
    }
    
    // Group by upload_id and reaction_type
    const reactions: Record<string, Record<string, boolean>> = {} as Record<string, Record<string, boolean>>
    
    (data as any)?.forEach((reaction: any) => {
      if (!reactions[reaction.upload_id]) {
        reactions[reaction.upload_id] = { heart: false, sparkle: false }
      }
      reactions[reaction.upload_id][reaction.reaction_type] = true
    })
    
    return reactions
  } catch (error) {
    console.error('Error fetching user reactions:', error)
    return {}
  }
}

/**
 * Get reaction counts for a single upload
 */
export async function getSingleUploadReactions(uploadId: string) {
  const supabase = createClient()
  
  try {
    const { data, error } = await (supabase.rpc as any)('get_photo_reaction_counts', {
      upload_uuid: uploadId
    })
    
    if (error) {
      console.error('Error fetching reaction counts:', error)
      return { heart: 0, sparkle: 0 }
    }
    
    // Convert array response to object
    const counts: Record<string, number> = { heart: 0, sparkle: 0 }
    data?.forEach((item: { reaction_type: string; count: number }) => {
      counts[item.reaction_type] = Number(item.count)
    })
    
    return counts
  } catch (error) {
    console.error('Error fetching reaction counts:', error)
    return { heart: 0, sparkle: 0 }
  }
}
