'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

// Define the shape of our signup form data
const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signUp } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    
    try {
      // Use our auth store to create account!
      const { error } = await signUp(data.email, data.password, data.fullName)
      
      if (error) {
        setError('root', { message: error })
        setIsLoading(false)
        return
      }
      
      // Success! Wait a bit for auth state to settle, then redirect
      console.log('🎉 Account created! Waiting for auth state to settle...')
      
      // Give Zustand store time to update and Supabase session to be established
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Redirecting to dashboard...')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('root', { message: 'An unexpected error occurred' })
      setIsLoading(false)
    }
  }

  return (
        <div className="w-full max-w-xl relative 
    rounded-3xl !p-10 
    bg-white/20 
    backdrop-blur-2xl 
    shadow-2xl 
    border border-white/30 ">

        {/* ✅ TITLE */}
        <div className="!mb-8">
            <h1 className="text-5xl !p-4 font-medium text-white">Sign Up</h1>
            <p className="mt-3 !sm:text-sm text-sm text-white">
            Already have an account? Access it{' '}
            <Link href="/login" className="!text-blue-300 !underline !font-medium">
                here
            </Link>{' '}
            !
            </p>
        </div>

        {/* ✅ FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="!space-y-4">
          {/* FULL NAME */}
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium text-white">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              {...register('fullName')}
              disabled={isLoading}
              className="mt-1
                bg-white/5
                border border-white/30
                backdrop-blur-lg
                text-black
                placeholder:text-gray-600
                !p-4
                rounded-xl
                focus:ring-2 focus:ring-indigo-400/50"
            />
            {errors.fullName && (
              <p className="text-xs text-orange-500 !mt-1">{errors.fullName.message}</p>
            )}
          </div>

          {/* EMAIL */}
          <div>
          <Label htmlFor="email" className="text-sm font-medium text-white">
              Email
          </Label>
          <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              {...register('email')}
              disabled={isLoading}
              className="mt-1
              bg-white/5
              border border-white/30
              backdrop-blur-lg
              text-black
              placeholder:text-gray-600
              !p-4
              rounded-xl
              focus:ring-2 focus:ring-indigo-400/50"
          />
          {errors.email && (
              <p className="text-xs text-orange-500 !mt-1">{errors.email.message}</p>
          )}
          </div>

          {/* PASSWORD */}
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-white">
                Password
            </Label>
            <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="new-password"
                {...register('password')}
                disabled={isLoading}
                className="mmt-1
                bg-white/5
                border border-white/30
                backdrop-blur-lg
                text-black
                placeholder:text-gray-600
                !p-4
                rounded-xl
                focus:ring-2 focus:ring-indigo-400/50"
            />
            {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-white">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              disabled={isLoading}
              className="!mmt-1
                bg-white/5
                border border-white/30
                backdrop-blur-lg
                text-black
                placeholder:text-gray-600
                !p-4
                rounded-xl
                focus:ring-2 focus:ring-indigo-400/50"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-orange-500 !mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* ROOT ERRORS */}
          {errors.root && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {errors.root.message}
            </div>
          )}

          {/* LOGIN BUTTON */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full py-3 text-white bg-brand-500 hover:bg-indigo-700 shadow-lg"
            >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
    </div>
  )
}