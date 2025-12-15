'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}

function VerifyEmailContent() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'pending'>('pending')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkVerification = async () => {
      const supabase = createClient()
      
      // Check if we have a token in the URL (from email link)
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      const code = searchParams.get('code')
      const errorParam = searchParams.get('error')

      // Handle error from callback redirect
      if (errorParam) {
        setStatus('error')
        setMessage(decodeURIComponent(errorParam))
        return
      }

      // Handle new format (token_hash + type)
      if (token_hash && type === 'email') {
        setStatus('verifying')
        
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'email'
          })

          if (error) {
            setStatus('error')
            setMessage(error.message || 'Verification failed. The link may have expired.')
          } else {
            setStatus('success')
            setMessage('Your email has been verified successfully!')
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          }
        } catch (error) {
          setStatus('error')
          setMessage('An unexpected error occurred during verification.')
        }
      } 
      // Handle old format (code parameter) - Supabase default email template
      else if (code) {
        setStatus('verifying')
        
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            setStatus('error')
            setMessage(error.message || 'Verification failed. The link may have expired.')
          } else {
            setStatus('success')
            setMessage('Your email has been verified successfully!')
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          }
        } catch (error) {
          setStatus('error')
          setMessage('An unexpected error occurred during verification.')
        }
      }
      else {
        // No token in URL, check if user is already logged in and just waiting for verification
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setEmail(user.email || '')
          if (user.email_confirmed_at) {
            setStatus('success')
            setMessage('Your email is already verified!')
          } else {
            setStatus('pending')
            setMessage('Please check your email for the verification link.')
          }
        }
      }
    }

    checkVerification()
  }, [searchParams, router])

  const handleResendEmail = async () => {
    const supabase = createClient()
    setStatus('verifying')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.email) {
        setStatus('error')
        setMessage('No email found. Please sign up again.')
        return
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      })

      if (error) {
        setStatus('error')
        setMessage(error.message)
      } else {
        setStatus('pending')
        setMessage('Verification email sent! Please check your inbox.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to resend verification email.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md relative rounded-3xl p-10 bg-white/20 backdrop-blur-2xl shadow-2xl border border-white/30">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className="relative">
            {status === 'verifying' && (
              <Loader2 className="h-16 w-16 text-white animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-16 w-16 text-green-400" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-red-400" />
            )}
            {status === 'pending' && (
              <Mail className="h-16 w-16 text-blue-400" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-medium text-white">
            {status === 'verifying' && 'Verifying...'}
            {status === 'success' && 'Verified!'}
            {status === 'error' && 'Verification Failed'}
            {status === 'pending' && 'Check Your Email'}
          </h1>

          {/* Message */}
          <p className="text-white/80 text-lg">
            {message || 'Processing your verification...'}
          </p>

          {email && status === 'pending' && (
            <p className="text-sm text-white/60">
              We sent a verification link to <span className="font-semibold">{email}</span>
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full pt-4">
            {status === 'success' && (
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full rounded-full py-3 text-white bg-brand-500 hover:bg-indigo-700 shadow-lg"
              >
                Go to Dashboard
              </Button>
            )}

            {status === 'pending' && (
              <>
                <Button
                  onClick={handleResendEmail}
                  className="w-full rounded-full py-3 text-white bg-brand-500 hover:bg-indigo-700 shadow-lg"
                >
                  Resend Verification Email
                </Button>
                <Link href="/login" className="text-sm text-white/80 hover:text-white underline">
                  Back to Login
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <Button
                  onClick={handleResendEmail}
                  className="w-full rounded-full py-3 text-white bg-brand-500 hover:bg-indigo-700 shadow-lg"
                >
                  Try Again
                </Button>
                <Link href="/signUp" className="text-sm text-white/80 hover:text-white underline">
                  Back to Sign Up
                </Link>
              </>
            )}
          </div>

          {status === 'pending' && (
            <div className="pt-6 text-xs text-white/60 space-y-2">
              <p>Didn't receive the email?</p>
              <ul className="list-disc list-inside text-left">
                <li>Check your spam or junk folder</li>
                <li>Make sure the email address is correct</li>
                <li>Wait a few minutes and try resending</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function VerifyEmailFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="flex items-center gap-3 text-white">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-white/80">Loading...</span>
      </div>
    </div>
  )
}
