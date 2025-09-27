
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { DistributorDashboard } from '@/components/distributor/distributor-dashboard'

export default async function DistributorPage() {
  const { organization, user } = await getCurrentOrganization()
  
  return (
    <ProtectedRoute permissions={[Permission.MANAGE_CLIENT_ORGANIZATIONS]}>
      <div className="min-h-screen bg-gray-50">
        <DistributorDashboard organization={organization} user={user} />
      </div>
    </ProtectedRoute>
  )
}

