// 'use client'

// import { useEffect, useState } from 'react'

// // Temporary inline client - we'll replace this later
// const createTempClient = () => {
//   if (typeof window === 'undefined') return null
  
//   const { createBrowserClient } = require('@supabase/ssr')
//   return createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   )
// }

// export default function TestConnection() {
//   const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
//   const [message, setMessage] = useState('')

//   useEffect(() => {
//     async function testConnection() {
//       try {
//         const supabase = createTempClient()
        
//         if (!supabase) {
//           setStatus('error')
//           setMessage('❌ Supabase client not available')
//           return
//         }

//         // Test basic connection - try to get session
//         const { data, error } = await supabase.auth.getSession()
        
//         if (error) {
//           setStatus('error')
//           setMessage(`❌ Auth error: ${error.message}`)
//         } else {
//           setStatus('success')
//           setMessage('✅ Connected to Supabase! Authentication is working.')
//         }
//       } catch (error) {
//         setStatus('error')
//         setMessage(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
//       }
//     }

//     testConnection()
//   }, [])

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
//         <h1 className="text-2xl font-bold mb-4 text-center">Supabase Connection Test</h1>
        
//         <div className={`p-4 rounded-md text-center ${
//           status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
//           status === 'success' ? 'bg-green-100 text-green-800' :
//           'bg-red-100 text-red-800'
//         }`}>
//           {status === 'loading' && '🔄 Testing connection to Supabase...'}
//           {status === 'success' && message}
//           {status === 'error' && message}
//         </div>
        
//         <div className="mt-6 p-4 bg-gray-100 rounded-md">
//           <h3 className="font-semibold mb-2">Environment Check:</h3>
//           <div className="text-sm space-y-1">
//             <div>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</div>
//             <div>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</div>
//           </div>
//         </div>

//         <div className="mt-4 text-sm text-gray-600">
//           <p>Note: "Table does not exist" errors are normal at this stage.</p>
//         </div>
//       </div>
//     </div>
//   )
// }

import { testConnection, TestConnectionResult } from '@/lib/test-connection'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// This route uses cookies (via Supabase client) so it must be dynamic
export const dynamic = 'force-dynamic'

export default async function TestConnectionPage() {
  const result: TestConnectionResult = await testConnection()

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
          <CardDescription>
            Testing Supabase connection and database setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${
              result.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
            }`}>
              <h3 className={`font-bold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '✅ Connection Successful' : '❌ Connection Failed'}
              </h3>
              {result.error && (
                <pre className="mt-2 text-sm text-red-600 overflow-auto">
                  {result.error}
                </pre>
              )}
            </div>

            {result.success && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <h4 className="font-semibold text-blue-800">Profiles Table</h4>
                  <p className="text-blue-600">Accessible: ✅</p>
                  <p className="text-blue-600">Rows: {result.profiles || 0}</p>
                </div>
                
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <h4 className="font-semibold text-blue-800">Auth Session</h4>
                  <p className="text-blue-600">
                    Status: {result.hasSession ? 'Active' : 'No session'}
                  </p>
                </div>
                
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <h4 className="font-semibold text-blue-800">Table Structure</h4>
                  <p className="text-blue-600">Accessible: {result.tableAccessible ? '✅' : '❌'}</p>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <h4 className="font-semibold text-yellow-800">Next Steps:</h4>
              <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
                <li>If connection fails, check environment variables</li>
                <li>Verify SQL scripts were executed in Supabase</li>
                <li>Check browser console for detailed errors</li>
                <li>Delete this test page after verification</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}