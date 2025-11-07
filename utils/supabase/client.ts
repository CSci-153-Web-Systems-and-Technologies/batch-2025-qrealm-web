import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Helper function to get the current session
export const getSession = async () => {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Helper function to get current user
export const getUser = async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
