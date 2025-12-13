'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function GuestNavbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="group">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-blue-800 transition-all">
              QRealm
            </span>
          </Link>

          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
