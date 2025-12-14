'use client'

import ResendVerification from '@/components/auth/resend-verification'
import Link from 'next/link'

export default function ResendVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md relative rounded-3xl p-10 bg-white/20 backdrop-blur-2xl shadow-2xl border border-white/30">
        <ResendVerification />
        
        <div className="mt-6 text-center">
          <Link 
            href="/login" 
            className="text-sm text-white/80 hover:text-white underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
