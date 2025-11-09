'use client'

import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import TestEventStore from '@/components/test-event-store'

//Temporary Admin Dashboard Page

export default function DashboardPage() {
  const { user, signOut } = useAuthStore()

  const handleSignOut = async () => {
    await signOut()
    // The protected route will automatically redirect to login
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome to your QRealm administration panel
        </p>
      </div>

      {/* Temporary test component */}
      <TestEventStore />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Current user information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Name:</strong> {user?.full_name || 'Not set'}</p>
            <p><strong>Role:</strong> {user?.role}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              Create New Event
            </Button>
            <Button className="w-full" variant="outline">
              View All Events
            </Button>
            <Button className="w-full" variant="outline">
              Moderation Queue
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSignOut}
              variant="destructive" 
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}