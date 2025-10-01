
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { hasPermission, userHasPermission, Permission } from '@/lib/permissions'
import CampaignsDashboard from '@/components/campaigns/campaigns-dashboard'

export const metadata = {
  title: 'La Máquina de Crecimiento - COMODÍN IA',
  description: 'Sistema de campañas profesionales con segmentación avanzada'
}

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.organizationId) {
    redirect('/auth/signin')
  }

  if (!userHasPermission(session.user.role, Permission.VIEW_CAMPAIGNS)) {
    redirect('/dashboard')
  }

  const canCreateCampaigns = userHasPermission(session.user.role, Permission.CREATE_CAMPAIGNS)
  const canExecuteCampaigns = userHasPermission(session.user.role, Permission.EXECUTE_CAMPAIGNS)
  const canPauseCampaigns = userHasPermission(session.user.role, Permission.PAUSE_CAMPAIGNS)

  return (
    <div className="container mx-auto px-4 py-8">
      <CampaignsDashboard
        canCreateCampaigns={canCreateCampaigns}
        canExecuteCampaigns={canExecuteCampaigns}
        canPauseCampaigns={canPauseCampaigns}
      />
    </div>
  )
}
