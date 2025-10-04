
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { WalletPage } from '@/components/billing/wallet-page'

export default async function WalletPageRoute() {
  const { organization, user } = await getCurrentOrganization()

  return (
    <ProtectedRoute permissions={[Permission.VIEW_BILLING]}>
      <div className="p-6">
        <WalletPage organizationId={organization.id} />
      </div>
    </ProtectedRoute>
  )
}
