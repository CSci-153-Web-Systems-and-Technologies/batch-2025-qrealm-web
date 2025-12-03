import { useMemo } from 'react'

export const useEventCover = (coverImageUrl: string | null | undefined): string => {
  return useMemo(() => {
    // Return the actual image URL if it exists and is not empty
    if (coverImageUrl && coverImageUrl.trim() !== '') {
      return coverImageUrl
    }
    // Use the exact placeholder URL
    return 'https://placehold.net/default.png'
  }, [coverImageUrl])
}