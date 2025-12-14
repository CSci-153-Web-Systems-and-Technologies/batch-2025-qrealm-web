import { create } from 'zustand'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/utils/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  user: Profile | null
  isLoading: boolean
  isInitialized: boolean
  setUser: (user: Profile | null) => void
  setLoading: (loading: boolean) => void
  checkAuth: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isInitialized: false,
  
  setUser: (user) => set({ user }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  checkAuth: async () => {
    const supabase = createClient()
    
    try {
      set({ isLoading: true })
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Fetch user profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (error) {
          console.error('Error fetching profile:', error)
          set({ user: null, isLoading: false, isInitialized: true })
          return
        }
        
        set({ user: profile, isLoading: false, isInitialized: true })
      } else {
        set({ user: null, isLoading: false, isInitialized: true })
      }
    } catch (error) {
      console.error('Auth check error:', error)
      set({ user: null, isLoading: false, isInitialized: true })
    }
  },
  
  signIn: async (email: string, password: string) => {
    const supabase = createClient()
    
    try {
      set({ isLoading: true })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        set({ isLoading: false })
        return { error: error.message }
      }
      
      if (data.user) {
        // Fetch user profile after successful sign in
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          console.error('Error fetching profile after sign in:', profileError)
          set({ isLoading: false })
          return { error: 'Failed to load user profile' }
        }
        
        set({ user: profile, isLoading: false })
        return { error: null }
      }
      
      set({ isLoading: false })
      return { error: 'Sign in failed' }
    } catch (error) {
      console.error('Sign in error:', error)
      set({ isLoading: false })
      return { error: 'An unexpected error occurred' }
    }
  },
  
  signUp: async (email: string, password: string, fullName: string) => {
    const supabase = createClient()
    
    try {
      set({ isLoading: true })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      
      if (error) {
        set({ isLoading: false })
        return { error: error.message }
      }
      
      if (data.user) {
        // Immediately fetch the profile that was created by the trigger
        // Add small delay to ensure trigger has executed
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (!profileError && profile) {
          set({ user: profile, isLoading: false, isInitialized: true })
          return { error: null }
        }
      }
      
      set({ isLoading: false, isInitialized: true })
      return { error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      set({ isLoading: false, isInitialized: true })
      return { error: 'An unexpected error occurred' }
    }
  },
  
  signOut: async () => {
    const supabase = createClient()
    
    try {
      set({ isLoading: true })
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
      }
      
      set({ user: null, isLoading: false })
    } catch (error) {
      console.error('Sign out error:', error)
      set({ isLoading: false })
    }
  },
}))