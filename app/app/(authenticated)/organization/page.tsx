
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { OrganizationManager } from '@/components/organization/organization-manager'

export default async function OrganizationPage() {
  const { organization, user } = await getCurrentOrganization()

  return (
    <ProtectedRoute permissions={[Permission.MANAGE_ORGANIZATION]}>
      <OrganizationManager organization={organization} user={user} />
    </ProtectedRoute>
  )
}
