
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { AIProvidersManager } from '@/components/admin/ai-providers-manager'
import { AICacheManager } from '@/components/admin/ai-cache-manager'

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Super Admin */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Super Administración</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Gestión centralizada de la plataforma COMODÍN IA
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{session.user.name || session.user.email}</p>
                  <p className="text-xs text-red-600 font-medium">Super Admin</p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">SA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navegación lateral */}
          <aside className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gestión del Sistema</h2>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#ai-providers"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    🤖 Gestión de IA
                  </a>
                </li>
                <li>
                  <a
                    href="#organizations"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    🏢 Organizaciones
                  </a>
                </li>
                <li>
                  <a
                    href="#users"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    👥 Usuarios
                  </a>
                </li>
                <li>
                  <a
                    href="#billing"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    💰 Facturación
                  </a>
                </li>
                <li>
                  <a
                    href="#analytics"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    📊 Analíticas
                  </a>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Contenido principal */}
          <main className="lg:col-span-3">
            <div id="ai-providers">
              <AIProvidersManager />
            </div>

            {/* Caché Inteligente de IA */}
            <div className="mt-8">
              <AICacheManager />
            </div>

            {/* Secciones futuras */}
            <div id="organizations" className="mt-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Organizaciones</h3>
                <p className="text-gray-600">Esta sección estará disponible próximamente.</p>
              </div>
            </div>

            <div id="users" className="mt-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Usuarios</h3>
                <p className="text-gray-600">Esta sección estará disponible próximamente.</p>
              </div>
            </div>

            <div id="billing" className="mt-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Facturación</h3>
                <p className="text-gray-600">Esta sección estará disponible próximamente.</p>
              </div>
            </div>

            <div id="analytics" className="mt-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analíticas del Sistema</h3>
                <p className="text-gray-600">Esta sección estará disponible próximamente.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
