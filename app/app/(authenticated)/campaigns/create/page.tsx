
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { hasPermission, userHasPermission, Permission } from '@/lib/permissions'
import CampaignWizard from '@/components/campaigns/campaign-wizard'

export const metadata = {
  title: 'Crear Campaña - COMODÍN IA',
  description: 'Crear nueva campaña con segmentación avanzada'
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
    <div className="container mx-auto px-4 py-8">
      <CampaignWizard />
    </div>
  )
}
