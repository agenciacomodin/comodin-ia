
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { ContactsManager } from '@/components/contacts/contacts-manager'

export default async function ContactsPage() {
  const { organization, user } = await getCurrentOrganization()

  return (
    <ProtectedRoute permissions={[Permission.VIEW_CONTACTS, Permission.MANAGE_CONTACTS]}>
      <ContactsManager />
    </ProtectedRoute>
  )
}
