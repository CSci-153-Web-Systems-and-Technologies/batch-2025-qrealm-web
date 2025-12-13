'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Sparkles, LayoutDashboard, Plus, QrCode, User, LogOut, ChevronDown, ShieldCheck } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface TopNavbarProps {
  userEmail?: string | null
}

export default function TopNavbar({ userEmail }: TopNavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { name: 'Discover', href: '/discover', icon: Sparkles, description: 'Browse all events' },
    { name: 'QR Scanner', href: '/scanner', icon: QrCode, description: 'Scan event codes', disabled: true },
    { name: 'Create', href: '/events/new', icon: Plus, description: 'New event' },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Manage events' },
    { name: 'Moderate', href: '/moderate', icon: ShieldCheck, description: 'Review photos' },
  ] as const

  return (
    <nav className="bg-white border-b border-brand-600/10 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/discover" className="group">
            <span className="text-2xl font-bold text-brand-600 group-hover:text-brand-700 transition-colors">
              QRealm
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)

              if ((link as any).disabled) {
                return (
                  <div
                    key={link.name}
                    className="relative px-4 py-2 rounded-lg text-gray-400 cursor-not-allowed flex items-center gap-2"
                    title="Coming soon"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{link.name}</span>
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                      Soon
                    </span>
                  </div>
                )
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    active ? 'bg-brand/10 text-brand-600' : 'text-gray-700 hover:bg-brand/5 hover:text-brand-600'
                  }`}
                  title={link.description}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{link.name}</span>
                  {active && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-600 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand/10 transition-colors"
              aria-haspopup="menu"
              aria-expanded={isDropdownOpen}
            >
              <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center ring-1 ring-brand-600/30">
                <User className="h-4 w-4 text-white" />
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-brand-600/10 py-2">
                <div className="px-4 py-3 border-b border-brand-600/10">
                  <p className="text-sm font-medium text-gray-900">Signed in as</p>
                  <p className="text-sm text-gray-600 truncate mt-1">{userEmail || 'user@example.com'}</p>
                </div>

                <div className="md:hidden py-2 border-b border-brand-600/10">
                  {navLinks.map((link) => {
                    const Icon = link.icon
                    if ((link as any).disabled) {
                      return (
                        <div key={link.name} className="px-4 py-2 text-gray-400 flex items-center gap-3 cursor-not-allowed">
                          <Icon className="h-4 w-4" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{link.name}</div>
                            <div className="text-xs text-gray-400">{link.description}</div>
                          </div>
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Soon</span>
                        </div>
                      )
                    }
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsDropdownOpen(false)}
                        className="px-4 py-2 hover:bg-brand/5 flex items-center gap-3 transition-colors"
                      >
                        <Icon className="h-4 w-4 text-brand-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{link.name}</div>
                          <div className="text-xs text-gray-500">{link.description}</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 hover:bg-red-50/50 flex items-center gap-3 text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
