import ProtectedRoute from '@/components/auth/protected-route'

//Temporary Admin Layout with Protected Route

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen !bg-brand-50">
        <header className="bg-white shadow-sm border-b">
          <div className="!max-w-7xl mx-auto !px-4 !sm:px-6 !lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-gray-900">
                QRealm Admin Dashboard
              </h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Welcome, Admin!
                </span>
              </div>
            </div>
          </div>
        </header>
        <main className="w-full min-h-screen px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}