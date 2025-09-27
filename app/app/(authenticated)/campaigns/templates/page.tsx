
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { hasPermission, Permission } from '@/lib/permissions'
import TemplateManager from '@/components/campaigns/template-manager'

export const metadata = {
  title: 'Gestor de Plantillas - COMODÍN IA',
  description: 'Gestionar plantillas de mensajes pre-aprobadas por Meta'
}

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.organizationId) {
    redirect('/auth/signin')
  }

  if (!hasPermission(session.user.role, Permission.VIEW_MESSAGE_TEMPLATES)) {
    redirect('/campaigns')
  }

  const canCreateTemplates = hasPermission(session.user.role, Permission.CREATE_MESSAGE_TEMPLATES)
  const canManageTemplates = hasPermission(session.user.role, Permission.MANAGE_MESSAGE_TEMPLATES)
  const canSyncMeta = hasPermission(session.user.role, Permission.SYNC_META_TEMPLATES)

  return (
    <div className="container mx-auto px-4 py-8">
      <TemplateManager
        canCreateTemplates={canCreateTemplates}
        canManageTemplates={canManageTemplates}
        canSyncMeta={canSyncMeta}
      />
    </div>
  )
}
