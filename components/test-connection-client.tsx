'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'

export function TestConnectionClient() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const runTest = async () => {
    setLoading(true)
    setResult(null)

    try {
      const supabase = createClient()
      
      // Test client-side connection
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      setResult({
        success: !error,
        error,
        data
      })
    } catch (error) {
      setResult({
        success: false,
        error
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-bold">Client-Side Connection Test</h3>
      <Button onClick={runTest} disabled={loading}>
        {loading ? 'Testing...' : 'Run Client Test'}
      </Button>

      {result && (
        <div className={`p-3 rounded ${
          result.success ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <pre className="text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}