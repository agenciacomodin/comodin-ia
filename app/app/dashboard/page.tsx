
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { OwnerDashboard } from '@/components/dashboard/owner-dashboard'
import { AgentDashboard } from '@/components/dashboard/agent-dashboard'

export default async function DashboardPage() {
  const { organization, user } = await getCurrentOrganization()

  return (
    <ProtectedRoute permissions={[Permission.VIEW_ASSIGNED_CONVERSATIONS, Permission.VIEW_ALL_CONVERSATIONS]}>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader organization={organization} user={user} />
        
        {/* Renderizar dashboard específico según el rol */}
        {user.role === 'PROPIETARIO' ? (
          <OwnerDashboard organization={organization} user={user} />
        ) : (
          <AgentDashboard organization={organization} user={user} />
        )}
      </div>
    </ProtectedRoute>
  )
}
