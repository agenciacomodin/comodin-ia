import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-indigo-600">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mt-4">Página no encontrada</h2>
        <p className="text-gray-600 mt-2 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Link 
          href="/dashboard"
          className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  )
}
