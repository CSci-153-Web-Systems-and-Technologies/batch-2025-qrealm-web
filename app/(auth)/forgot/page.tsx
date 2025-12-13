import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export const metadata = {
  title: 'Forgot Password | QRealm',
  description: 'Reset your QRealm password',
}

export default async function ForgotPasswordPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If already logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="rounded-3xl p-10 bg-white/20 backdrop-blur-2xl shadow-2xl border border-white/30">
          <div className="mb-8">
            <h1 className="text-5xl font-medium text-white mb-2">Reset Password</h1>
            <p className="text-white/80">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <strong>Feature coming soon!</strong> Password reset functionality will be available shortly.
          </div>

          <div className="mt-6 text-center">
            <a href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              ← Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
