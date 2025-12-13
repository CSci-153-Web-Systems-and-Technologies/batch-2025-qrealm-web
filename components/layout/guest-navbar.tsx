'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function GuestNavbar() {
  return (
    <nav className="bg-white border-b border-brand-600/10 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="group">
            <span className="text-2xl font-bold text-brand-600 group-hover:text-brand-700 transition-colors">
              QRealm
            </span>
          </Link>

          <Button
            asChild
            className="bg-brand-600 hover:bg-brand-700 text-white"
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
