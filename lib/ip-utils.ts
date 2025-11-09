// Simple IP utility - in production, you'd get this from your API
export async function getClientIP(): Promise<string> {
  if (typeof window === 'undefined') {
    // Server-side: you'd get from request headers
    return 'server'
  }
  
  // Client-side: try to get IP from a service or use placeholder
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.warn('Could not fetch IP address:', error)
    return 'unknown'
  }
}