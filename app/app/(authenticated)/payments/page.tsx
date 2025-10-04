
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { PaymentsManager } from '@/components/payments/payments-manager'

export default async function PaymentsPage() {
  const { organization, user } = await getCurrentOrganization()

  return (
    <ProtectedRoute permissions={[Permission.MANAGE_ORGANIZATION]}>
      <PaymentsManager />
    </ProtectedRoute>
  )
}
