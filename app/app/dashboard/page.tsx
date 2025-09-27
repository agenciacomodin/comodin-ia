
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentActivity } from '@/components/dashboard/recent-activity'

export default async function DashboardPage() {
  const { organization, user } = await getCurrentOrganization()

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader organization={organization} user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Hola {user.fullName || user.name}! 👋
          </h1>
          <p className="text-gray-600">
            Bienvenido al panel de control de <span className="font-semibold">{organization.name}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Estadísticas principales */}
          <div className="lg:col-span-2">
            <DashboardStats organizationId={organization.id} />
          </div>
          
          {/* Acciones rápidas */}
          <div className="space-y-6">
            <QuickActions userRole={user.role} />
            <RecentActivity organizationId={organization.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
