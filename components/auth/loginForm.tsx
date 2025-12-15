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

// Define the shape of our login form data
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signIn } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    // Use our auth store to sign in!
    const { error } = await signIn(data.email, data.password)
    
    if (error) {
      // Show error to user
      setError('root', { message: error })
    } else {
      // Success! Redirect to dashboard
      console.log('🎉 Login successful! Redirecting to dashboard...')
      router.push('/dashboard')
      router.refresh() // Refresh to update any server components
    }
    
    setIsLoading(false)
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
            <h1 className="text-5xl !p-4 font-medium text-white">Sign in</h1>
            <p className="mt-3 !sm:text-sm text-sm text-white">
            Don’t have an account?{' '}
            <Link href="/signUp" className="!text-blue-300 !underline !font-medium">
                Create your account
            </Link>{' '}
            it takes less than a minute
            </p>
        </div>

        {/* ✅ FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="!space-y-6">

            {/* EMAIL */}
            <div>
            <Label htmlFor="email" className="text-sm font-medium text-white">
                Email
            </Label>
            <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                autoComplete="email"
                {...register('email')}
                disabled={isLoading}
                className="mmt-1
                bg-white/20
                border border-white/30
                backdrop-blur-lg
                text-black
                placeholder:text-gray-500
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
                autoComplete="current-password"
                {...register('password')}
                disabled={isLoading}
                className="mmt-1
                bg-white/20
                border border-white/30
                backdrop-blur-lg
                text-black
                placeholder:text-gray-500
                !p-4
                rounded-xl
                focus:ring-2 focus:ring-indigo-400/50"
            />
            {errors.password && (
                <p className="text-xs text-orange-500 !mt-1">{errors.password.message}</p>
            )}
            </div>

            {/* REMEMBER + FORGOT */}
            <div className="flex justify-between items-center !text-[12px] text-white-600">
                <label className="flex items-center gap-2">
                    <input type="checkbox"
                    className="
                        w-4 h-4
                        rounded
                        border border-white/30
                        !bg-white
                        !backdrop-blur-md
                        cursor-pointer
                        accent-indigo-400
                        shadow-sm"
                    />
                    Remember me
                </label>

                <Link
                    href="/forgot"
                    className="text-white-600 hover:text-indigo-600 !text-[12px]"
                >
                    Forgot Password?
                </Link>
            </div>

            {/* ROOT ERROR */}
            {errors.root && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {errors.root.message}
                {errors.root.message?.includes('verify your email') && (
                  <div className="mt-2">
                    <Link 
                      href="/resend-verification" 
                      className="text-indigo-600 hover:text-indigo-700 underline font-medium"
                    >
                      Resend verification email
                    </Link>
                  </div>
                )}
            </div>
            )}

            {/* LOGIN BUTTON */}
            <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full py-3 text-white bg-brand-500 hover:bg-indigo-700 shadow-lg"
            >
            {isLoading ? 'Signing in...' : 'Login'}
            </Button>
        </form>

        
    </div>
  )
}