
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { IntegrationsManager } from '@/components/integrations/integrations-manager'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function IntegrationsPage() {
  const { organization, user } = await getCurrentOrganization()

  return (
    <ProtectedRoute permissions={[Permission.VIEW_INTEGRATIONS]}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/settings">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Configuración
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Centro de Integraciones</h1>
          <p className="text-gray-600 mt-1">
            Conecta COMODÍN IA con las herramientas de tu negocio para automatizar procesos y mejorar la atención al cliente
          </p>
        </div>

        {/* Gestor de Integraciones */}
        <IntegrationsManager organizationId={organization.id} />
      </div>
    </ProtectedRoute>
  )
}
