

import { FollowUpSystem } from '@/components/crm/follow-up-system'

export const metadata = {
  title: 'Seguimientos - COMODÍN IA',
  description: 'Gestiona el seguimiento automático de conversaciones abiertas',
}

export default function FollowUpsPage() {
  return (
    <div className="container mx-auto py-6">
      <FollowUpSystem />
    </div>
  )
}
