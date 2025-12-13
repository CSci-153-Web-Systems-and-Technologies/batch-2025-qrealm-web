import { createClient } from '@/utils/supabase/server'

export interface TestConnectionResult {
  success: boolean
  profiles?: number
  hasSession?: boolean
  tableAccessible?: boolean
  error?: string | null
}

export async function testConnection(): Promise<TestConnectionResult> {
  try {
    const supabase = await createClient()
    console.log('🔌 Testing Supabase connection...')
    
    // Test 1: Basic query to profiles table
    console.log('📊 Test 1: Querying profiles table...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profilesError) {
      console.error('❌ Profiles query failed:', profilesError)
      return { 
        success: false, 
        error: `Profiles query failed: ${profilesError.message}` 
      }
    }

    console.log('✅ Profiles table accessible:', profiles?.length || 0, 'rows found')

    // Test 2: Check auth session
    console.log('🔐 Test 2: Checking auth session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('❌ Auth session check failed:', sessionError)
      return { 
        success: false, 
        error: `Auth session check failed: ${sessionError.message}` 
      }
    } else {
      console.log('✅ Auth session check passed - User:', session ? 'Logged in' : 'Not logged in')
    }

    // Test 3: Test database structure
    console.log('🏗️ Test 3: Checking table structure...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .limit(0) // Just get column info

    if (tableError) {
      console.error('❌ Table structure check failed:', tableError)
      return { 
        success: false, 
        error: `Table structure check failed: ${tableError.message}` 
      }
    } else {
      console.log('✅ Table structure is accessible')
    }

    console.log('🎉 All connection tests completed successfully!')
    return { 
      success: true, 
      profiles: profiles?.length || 0,
      hasSession: !!session,
      tableAccessible: !tableError
    }

  } catch (error) {
    console.error('💥 Connection test failed with exception:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return { 
      success: false, 
      error: `Connection test failed: ${errorMessage}` 
    }
  }
}