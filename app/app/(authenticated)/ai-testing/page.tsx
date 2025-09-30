
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Permission } from '@/lib/permissions'
import { AIResolutionTester } from '@/components/crm/ai-resolution-tester'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pruebas de IA | COMODÍN IA',
  description: 'Prueba y evalúa el rendimiento de la IA resolutiva con Knowledge Base'
}

export default async function AITestingPage() {
  const { organization, user } = await getCurrentOrganization()

  return (
    <ProtectedRoute permissions={[Permission.VIEW_CRM_INBOX]}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pruebas de IA</h1>
          <p className="text-gray-600 mt-1">Prueba y evalúa el rendimiento de la IA resolutiva con Knowledge Base</p>
        </div>
        <AIResolutionTester />
      </div>
    </ProtectedRoute>
  )
}
