
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { hasPermission, userHasPermission, Permission } from '@/lib/permissions'
import NewCampaignWizard from '@/components/campaigns/new-campaign-wizard'

export const metadata = {
  title: 'Crear Campaña - COMODÍN IA',
  description: 'Sistema profesional de campañas con segmentación avanzada'
}

export default async function CreateCampaignPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.organizationId) {
    redirect('/auth/signin')
  }

  if (!userHasPermission(session.user.role, Permission.CREATE_CAMPAIGNS)) {
    redirect('/campaigns')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <NewCampaignWizard />
    </div>
  )
}
