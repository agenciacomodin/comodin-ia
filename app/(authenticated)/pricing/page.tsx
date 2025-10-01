
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { PricingManager } from '@/components/pricing/pricing-manager'

export default async function PricingPage() {
  const { organization, user } = await getCurrentOrganization()

  return (
    <ProtectedRoute permissions={[Permission.MANAGE_ORGANIZATION]}>
      <PricingManager />
    </ProtectedRoute>
  )
}
