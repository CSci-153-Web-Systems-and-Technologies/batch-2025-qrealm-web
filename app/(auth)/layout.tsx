import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-8">
      {/* Mobile logo */}
      <div className="w-full max-w-sm lg:max-w-md rounded-lg shadow p-8">
        <Link href="/" className="absolute top-4 left-4 text-2xl font-bold text-blue-600 mb-8 block">
          QRealm
        </Link>

        {/* ✅ Auth box */}
        <div className="w-full max-w-sm lg:max-w-md">
          {children}
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-blue-100 text-sm text-center mt-8">
          © 2024 QRealm. Making memories magical.
        </div>
      </div>
    </div>

  )
}