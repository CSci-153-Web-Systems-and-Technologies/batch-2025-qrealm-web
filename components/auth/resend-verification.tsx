'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail } from 'lucide-react'

interface ResendVerificationProps {
  email?: string
  onSuccess?: () => void
}

export default function ResendVerification({ email: initialEmail, onSuccess }: ResendVerificationProps) {
  const [email, setEmail] = useState(initialEmail || '')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          // Redirect to homepage so Supabase query params get intercepted by proxy
          emailRedirectTo: `${window.location.origin}/`,
        }
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Verification email sent! Please check your inbox and spam folder.' 
        })
        if (onSuccess) onSuccess()
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send verification email' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex items-center gap-2 text-white mb-4">
        <Mail className="h-5 w-5" />
        <h3 className="text-lg font-medium">Resend Verification Email</h3>
      </div>

      <form onSubmit={handleResend} className="space-y-4">
        <div>
          <Label htmlFor="resend-email" className="text-sm font-medium text-white">
            Email Address
          </Label>
          <Input
            id="resend-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || !!initialEmail}
            className="mt-1 bg-white/10 border border-white/30 text-white placeholder:text-white/50"
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-500/20 text-green-100 border border-green-500/30'
                : 'bg-red-500/20 text-red-100 border border-red-500/30'
            }`}
          >
            {message.text}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !email}
          className="w-full rounded-full py-3 text-white bg-brand-500 hover:bg-indigo-700 shadow-lg"
        >
          {isLoading ? 'Sending...' : 'Resend Verification Email'}
        </Button>
      </form>

      <div className="text-xs text-white/60 space-y-2 pt-4">
        <p className="font-medium">Didn't receive the email?</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Check your spam or junk folder</li>
          <li>Make sure the email address is correct</li>
          <li>Wait a few minutes before requesting another email</li>
        </ul>
      </div>
    </div>
  )
}
