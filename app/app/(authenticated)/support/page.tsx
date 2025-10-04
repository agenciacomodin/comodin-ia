
import { Metadata } from 'next'
import TicketList from '@/components/support/ticket-list'
import TicketStats from '@/components/support/ticket-stats'

export const metadata: Metadata = {
  title: 'Soporte Técnico | COMODÍN IA',
  description: 'Sistema de tickets de soporte técnico'
}

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Soporte Técnico</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tus tickets de soporte y obtén ayuda de nuestro equipo técnico
        </p>
      </div>

      <TicketStats />
      <TicketList />
    </div>
  )
}
