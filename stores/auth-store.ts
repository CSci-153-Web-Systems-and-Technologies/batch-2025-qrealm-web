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
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null; requiresVerification?: boolean }>
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
          // If it's a 406 error or profile not found, sign out the user
          if (error.code === 'PGRST116' || error.message.includes('406')) {
            console.log('Profile not found or access denied - signing out')
            await supabase.auth.signOut()
          }
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
        // Check if email is verified
        if (!data.user.email_confirmed_at) {
          // Sign out the user since email is not verified
          await supabase.auth.signOut()
          set({ isLoading: false })
          return { error: 'Please verify your email address before signing in. Check your inbox for the verification link.' }
        }
        
        // Fetch user profile after successful sign in
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          console.error('Error fetching profile after sign in:', profileError)
          // Provide more specific error messages
          let errorMessage = 'Failed to load user profile'
          if (profileError.code === 'PGRST116') {
            errorMessage = 'Profile not found. Please contact support.'
          } else if (profileError.message.includes('406')) {
            errorMessage = 'Access denied. Please check your permissions.'
          }
          set({ isLoading: false })
          return { error: errorMessage }
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
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      
      if (error) {
        set({ isLoading: false })
        return { error: error.message }
      }
      
      if (data.user) {
        // Check if email confirmation is required
        if (data.user.identities && data.user.identities.length === 0) {
          // User already exists
          set({ isLoading: false, isInitialized: true })
          return { error: 'An account with this email already exists. Please sign in instead.' }
        }
        
        // Email verification is required, don't sign in the user yet
        // User will be logged out and redirected to verification page
        set({ user: null, isLoading: false, isInitialized: true })
        return { error: null, requiresVerification: true }
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