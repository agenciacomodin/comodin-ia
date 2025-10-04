
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { ProfileManager } from '@/components/profile/profile-manager'

export default async function ProfilePage() {
  const { organization, user } = await getCurrentOrganization()

  return (
    <ProtectedRoute permissions={[]}>
      <ProfileManager user={user} organization={organization} />
    </ProtectedRoute>
  )
}
