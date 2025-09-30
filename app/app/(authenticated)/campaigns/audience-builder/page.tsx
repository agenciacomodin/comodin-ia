
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { hasPermission, userHasPermission, Permission } from '@/lib/permissions'
import AudienceBuilder from '@/components/campaigns/audience-builder'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Constructor de Audiencias - COMODÍN IA',
  description: 'Herramienta avanzada para segmentación de audiencias'
}

export default async function AudienceBuilderPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.organizationId) {
    redirect('/auth/signin')
  }

  if (!userHasPermission(session.user.role, Permission.USE_AUDIENCE_BUILDER)) {
    redirect('/campaigns')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Constructor de Audiencias</h1>
          <p className="text-muted-foreground">
            Herramienta avanzada para crear segmentaciones precisas de tu base de contactos
          </p>
        </div>

        {/* Standalone Audience Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Herramienta de Segmentación</CardTitle>
            <CardDescription>
              Define criterios específicos para identificar tu audiencia objetivo. 
              Utiliza esta herramienta para probar diferentes segmentaciones antes de crear campañas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AudienceBuilder />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
