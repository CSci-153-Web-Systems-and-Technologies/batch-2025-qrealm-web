'use client'

import { useEffect, useState } from 'react'

// Temporary inline client - we'll replace this later
const createTempClient = () => {
  if (typeof window === 'undefined') return null
  
  const { createBrowserClient } = require('@supabase/ssr')
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export default function TestConnection() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createTempClient()
        
        if (!supabase) {
          setStatus('error')
          setMessage('❌ Supabase client not available')
          return
        }

        // Test basic connection - try to get session
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setStatus('error')
          setMessage(`❌ Auth error: ${error.message}`)
        } else {
          setStatus('success')
          setMessage('✅ Connected to Supabase! Authentication is working.')
        }
      } catch (error) {
        setStatus('error')
        setMessage(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Supabase Connection Test</h1>
        
        <div className={`p-4 rounded-md text-center ${
          status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
          status === 'success' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status === 'loading' && '🔄 Testing connection to Supabase...'}
          {status === 'success' && message}
          {status === 'error' && message}
        </div>
        
        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <h3 className="font-semibold mb-2">Environment Check:</h3>
          <div className="text-sm space-y-1">
            <div>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>Note: "Table does not exist" errors are normal at this stage.</p>
        </div>
      </div>
    </div>
  )
}