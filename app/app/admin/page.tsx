
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { SuperAdminDashboard } from '@/components/admin/super-admin-dashboard'

export default async function SuperAdminPage() {
  // El Super Admin no tiene una organización específica, maneja toda la plataforma
  
  return (
    <ProtectedRoute permissions={[Permission.PLATFORM_ADMINISTRATION]}>
      <div className="min-h-screen bg-gray-50">
        <SuperAdminDashboard />
      </div>
    </ProtectedRoute>
  )
}

