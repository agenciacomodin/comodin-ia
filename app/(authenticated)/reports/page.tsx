
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { ReportsManager } from '@/components/reports/reports-manager'

export default async function ReportsPage() {
  const { organization, user } = await getCurrentOrganization()

  return (
    <ProtectedRoute permissions={[Permission.VIEW_REPORTS]}>
      <ReportsManager />
    </ProtectedRoute>
  )
}
