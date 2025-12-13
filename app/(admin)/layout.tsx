import TopNavbar from '@/components/layout/top-navbar'
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
        <TopNavbar />
        <main className="w-full min-h-screen px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}