

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Organization } from '@prisma/client'
import { ExtendedUser } from '@/lib/auth'
import { ConditionalRender } from '@/components/auth/conditional-render'
import { HierarchyGuard } from '@/components/hierarchy/hierarchy-guard'
import { RoleBadge } from '@/components/hierarchy/role-badge'
import { Permission } from '@/lib/permissions'
import { TeamHierarchyView } from '@/components/team/team-hierarchy-view'
import { InviteUserModal } from '@/components/invitations/InviteUserModal'
import { InvitationsList } from '@/components/invitations/InvitationsList'
import { 
  MessageCircle, 
  Users, 
  DollarSign, 
  Settings,
  MessageSquare,
  Bot,
  TrendingUp,
  UserPlus,
  Zap,
  Building2,
  Shield,
  Activity,
  CreditCard
} from 'lucide-react'
import { SubscriptionWidget } from './subscription-widget'

interface OwnerDashboardProps {
  organization: Organization
  user: ExtendedUser
}

export function OwnerDashboard({ organization, user }: OwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  // Mock data para team members - en producción esto vendría de la API
  const mockTeamMembers = [
    {
      id: user.id,
      name: user.name || 'Propietario',
      email: user.email,
      role: user.role,
      isActive: true,
      lastLogin: new Date(),
      organizationId: user.organizationId,
      organizationName: organization.name
    },
    {
      id: 'agent1',
      name: 'Ana Martínez',
      email: 'ana@empresa.com',
      role: 'AGENTE' as const,
      isActive: true,
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
      organizationId: user.organizationId,
      organizationName: organization.name
    },
    {
      id: 'agent2',
      name: 'Luis García',
      email: 'luis@empresa.com',
      role: 'AGENTE' as const,
      isActive: true,
      lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hace 1 día
      organizationId: user.organizationId,
      organizationName: organization.name
    }
  ]

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header mejorado con jerarquía */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                ¡Hola {user.fullName || user.name}! 👋
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <RoleBadge role={user.role} size="sm" />
                <span className="text-gray-600">de</span>
                <span className="font-semibold">{organization.name}</span>
                <Badge variant="outline" className="text-xs">
                  {organization.status}
                </Badge>
              </div>
            </div>
          </div>
          
          <HierarchyGuard allowedRoles={['PROPIETARIO']}>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
              <Button size="sm" onClick={() => setInviteModalOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invitar Agente
              </Button>
            </div>
          </HierarchyGuard>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="conversations">Conversaciones</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
          <TabsTrigger value="automation">Automatización</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Overview Tab mejorado */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards con mejor jerarquía visual */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversaciones Activas</CardTitle>
                <MessageCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">47</div>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +12% desde ayer
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Miembros del Equipo</CardTitle>
                <Users className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{mockTeamMembers.length}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <Activity className="h-3 w-3 mr-1 text-blue-500" />
                  {mockTeamMembers.filter(m => m.isActive).length} agentes activos
                </div>
              </CardContent>
            </Card>

            <ConditionalRender permissions={[Permission.VIEW_BILLING]}>
              <SubscriptionWidget 
                organizationId={user.organizationId!} 
                userRole={user.role}
              />
            </ConditionalRender>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Respuesta Promedio</CardTitle>
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2.3m</div>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <Activity className="h-3 w-3 mr-1 text-purple-500" />
                  -30s desde la semana pasada
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions mejoradas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>
                Accede rápidamente a las funciones más importantes de tu organización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <ConditionalRender permissions={[Permission.MANAGE_WHATSAPP_CONFIG]}>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-200">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                    <span className="text-sm">Configurar WhatsApp</span>
                  </Button>
                </ConditionalRender>
                
                <ConditionalRender permissions={[Permission.INVITE_USERS]}>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-200"
                    onClick={() => setInviteModalOpen(true)}
                  >
                    <UserPlus className="h-6 w-6 text-blue-600" />
                    <span className="text-sm">Invitar Agente</span>
                  </Button>
                </ConditionalRender>
                
                <ConditionalRender permissions={[Permission.VIEW_BILLING]}>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-indigo-50 hover:border-indigo-200"
                    onClick={() => window.location.href = '/suscripcion'}
                  >
                    <CreditCard className="h-6 w-6 text-indigo-600" />
                    <span className="text-sm">Gestionar Plan</span>
                  </Button>
                </ConditionalRender>
                
                <ConditionalRender permissions={[Permission.CONFIGURE_AI]}>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-200">
                    <Bot className="h-6 w-6 text-purple-600" />
                    <span className="text-sm">Configurar IA</span>
                  </Button>
                </ConditionalRender>
                
                <ConditionalRender permissions={[Permission.MANAGE_ORGANIZATION]}>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 hover:border-gray-200">
                    <Settings className="h-6 w-6 text-gray-600" />
                    <span className="text-sm">Configuración</span>
                  </Button>
                </ConditionalRender>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversaciones Recientes</CardTitle>
                <CardDescription>
                  Últimas interacciones con clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { customer: 'María González', message: 'Consulta sobre productos', agent: 'Ana', time: 'Hace 5 min', status: 'active' },
                    { customer: 'Carlos López', message: 'Solicitud de cotización', agent: 'Luis', time: 'Hace 12 min', status: 'pending' },
                    { customer: 'Sofía Martínez', message: 'Seguimiento de pedido', agent: 'Ana', time: 'Hace 25 min', status: 'resolved' }
                  ].map((conversation, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">{conversation.customer}</p>
                        <p className="text-sm text-gray-600">{conversation.message}</p>
                        <p className="text-xs text-gray-500">Agente: {conversation.agent} • {conversation.time}</p>
                      </div>
                      <Badge variant={
                        conversation.status === 'active' ? 'default' : 
                        conversation.status === 'pending' ? 'secondary' : 'outline'
                      }>
                        {conversation.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado del Sistema</CardTitle>
                <CardDescription>
                  Conexiones y configuraciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">WhatsApp Business</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Conectado</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bot className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium">Asistente IA</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Activo</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium">Automatización</span>
                    </div>
                    <Badge variant="secondary">3 reglas activas</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Tab con jerarquía mejorada */}
        <TabsContent value="team" className="space-y-6">
          <TeamHierarchyView
            organization={organization}
            members={mockTeamMembers}
            currentUserRole={user.role}
          />
          
          <ConditionalRender permissions={[Permission.INVITE_USERS]}>
            <InvitationsList onInvite={() => setInviteModalOpen(true)} />
          </ConditionalRender>
        </TabsContent>

        {/* Otros tabs para desarrollo futuro */}
        <TabsContent value="conversations">
          <Card>
            <CardHeader>
              <CardTitle>Centro de Conversaciones</CardTitle>
              <CardDescription>
                Gestiona todas las conversaciones de WhatsApp de tu organización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Módulo de conversaciones en desarrollo...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Próximamente podrás gestionar todas las conversaciones desde aquí
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle>Automatización e IA</CardTitle>
              <CardDescription>
                Configura respuestas automáticas y asistente de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Configuración de automatización en desarrollo...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Próximamente podrás configurar respuestas automáticas y entrenar la IA
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de la Organización</CardTitle>
              <CardDescription>
                Administra los ajustes de {organization.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Panel de configuración en desarrollo...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Próximamente podrás configurar todos los aspectos de tu organización
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de invitación */}
      <InviteUserModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
    </main>
  )
}

