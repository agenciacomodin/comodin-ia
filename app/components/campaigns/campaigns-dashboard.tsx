
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Send, Users, TrendingUp, AlertCircle, Play, Pause, MoreVertical } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import {
  CampaignSummary,
  CampaignsStats,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
  CAMPAIGN_TYPE_LABELS
} from '@/lib/types'

interface CampaignsDashboardProps {
  canCreateCampaigns: boolean
  canExecuteCampaigns: boolean
  canPauseCampaigns: boolean
}

export default function CampaignsDashboard({
  canCreateCampaigns,
  canExecuteCampaigns,
  canPauseCampaigns
}: CampaignsDashboardProps) {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([])
  const [stats, setStats] = useState<CampaignsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('all')
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [campaignsRes, statsRes] = await Promise.all([
        fetch('/api/campaigns'),
        fetch('/api/campaigns/stats')
      ])

      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json()
        setCampaigns(campaignsData.data || [])
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      }

    } catch (error) {
      console.error('Error loading campaigns data:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos de campañas',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCampaignAction = async (campaignId: string, action: 'execute' | 'pause' | 'resume') => {
    try {
      let url = ''
      let method = 'POST'

      switch (action) {
        case 'execute':
          url = `/api/campaigns/${campaignId}/execute`
          break
        case 'pause':
          url = `/api/campaigns/${campaignId}/pause`
          break
        case 'resume':
          url = `/api/campaigns/${campaignId}/pause`
          method = 'DELETE'
          break
      }

      const response = await fetch(url, { method })
      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Éxito',
          description: data.message
        })
        loadData() // Recargar datos
      } else {
        throw new Error(data.error)
      }

    } catch (error) {
      console.error(`Error executing campaign action ${action}:`, error)
      toast({
        title: 'Error',
        description: `Error al ${action === 'execute' ? 'ejecutar' : action === 'pause' ? 'pausar' : 'reanudar'} la campaña`,
        variant: 'destructive'
      })
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    switch (selectedTab) {
      case 'active':
        return ['SENDING', 'SCHEDULED'].includes(campaign.status)
      case 'draft':
        return campaign.status === 'DRAFT'
      case 'completed':
        return campaign.status === 'COMPLETED'
      case 'paused':
        return ['PAUSED', 'CANCELLED', 'FAILED'].includes(campaign.status)
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">La Máquina de Crecimiento</h1>
            <p className="text-muted-foreground">Sistema de campañas profesionales con segmentación avanzada</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">La Máquina de Crecimiento</h1>
          <p className="text-muted-foreground">Sistema de campañas profesionales con segmentación avanzada</p>
        </div>
        {canCreateCampaigns && (
          <Button onClick={() => window.location.href = '/campaigns/create'}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Campaña
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Campañas</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeCampaigns} activas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensajes Enviados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessagesSent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Entrega</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgDeliveryRate.toFixed(1)}%</div>
              <Progress value={stats.avgDeliveryRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalCostThisMonth.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Este mes
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Campañas</CardTitle>
          <CardDescription>
            Gestiona tus campañas de marketing y comunicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">Todas ({campaigns.length})</TabsTrigger>
              <TabsTrigger value="active">
                Activas ({campaigns.filter(c => ['SENDING', 'SCHEDULED'].includes(c.status)).length})
              </TabsTrigger>
              <TabsTrigger value="draft">
                Borradores ({campaigns.filter(c => c.status === 'DRAFT').length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completadas ({campaigns.filter(c => c.status === 'COMPLETED').length})
              </TabsTrigger>
              <TabsTrigger value="paused">
                Pausadas ({campaigns.filter(c => ['PAUSED', 'CANCELLED', 'FAILED'].includes(c.status)).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="space-y-4 mt-4">
              {filteredCampaigns.length === 0 ? (
                <div className="text-center py-8">
                  <Send className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay campañas</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedTab === 'all' ? 'Comienza creando tu primera campaña' : `No hay campañas ${selectedTab === 'active' ? 'activas' : selectedTab === 'draft' ? 'en borrador' : selectedTab === 'completed' ? 'completadas' : 'pausadas'}`}
                  </p>
                  {canCreateCampaigns && selectedTab === 'all' && (
                    <div className="mt-6">
                      <Button onClick={() => window.location.href = '/campaigns/create'}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Campaña
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCampaigns.map((campaign) => (
                    <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{campaign.name}</h3>
                              <Badge 
                                variant="outline"
                                className={`text-xs ${
                                  CAMPAIGN_STATUS_COLORS[campaign.status] === 'green' ? 'bg-green-50 text-green-700 border-green-200' :
                                  CAMPAIGN_STATUS_COLORS[campaign.status] === 'yellow' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                  CAMPAIGN_STATUS_COLORS[campaign.status] === 'red' ? 'bg-red-50 text-red-700 border-red-200' :
                                  CAMPAIGN_STATUS_COLORS[campaign.status] === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  CAMPAIGN_STATUS_COLORS[campaign.status] === 'orange' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                  'bg-gray-50 text-gray-700 border-gray-200'
                                }`}
                              >
                                {CAMPAIGN_STATUS_LABELS[campaign.status]}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {CAMPAIGN_TYPE_LABELS[campaign.type]}
                              </Badge>
                            </div>
                            {campaign.description && (
                              <p className="text-sm text-muted-foreground">{campaign.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Plantilla: {campaign.templateName}</span>
                              <span>•</span>
                              <span>Audiencia: {campaign.targetAudienceSize.toLocaleString()}</span>
                              <span>•</span>
                              <span>Enviados: {campaign.messagesSent.toLocaleString()}</span>
                              {campaign.deliveryRate > 0 && (
                                <>
                                  <span>•</span>
                                  <span>Entrega: {campaign.deliveryRate.toFixed(1)}%</span>
                                </>
                              )}
                            </div>
                            {campaign.status === 'SENDING' && campaign.messagesSent > 0 && (
                              <div className="mt-2">
                                <Progress 
                                  value={(campaign.messagesSent / campaign.totalRecipients) * 100} 
                                  className="h-2"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  {campaign.messagesSent} de {campaign.totalRecipients} mensajes enviados
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Action buttons based on campaign status */}
                            {campaign.status === 'DRAFT' && canExecuteCampaigns && (
                              <Button 
                                size="sm" 
                                onClick={() => handleCampaignAction(campaign.id, 'execute')}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Ejecutar
                              </Button>
                            )}
                            
                            {campaign.status === 'SENDING' && canPauseCampaigns && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleCampaignAction(campaign.id, 'pause')}
                              >
                                <Pause className="h-4 w-4 mr-1" />
                                Pausar
                              </Button>
                            )}
                            
                            {campaign.status === 'PAUSED' && canExecuteCampaigns && (
                              <Button 
                                size="sm"
                                onClick={() => handleCampaignAction(campaign.id, 'resume')}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Reanudar
                              </Button>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem 
                                  onClick={() => window.location.href = `/campaigns/${campaign.id}`}
                                >
                                  Ver detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => window.location.href = `/campaigns/${campaign.id}/analytics`}
                                >
                                  Ver analíticas
                                </DropdownMenuItem>
                                {campaign.status === 'DRAFT' && (
                                  <DropdownMenuItem 
                                    onClick={() => window.location.href = `/campaigns/${campaign.id}/edit`}
                                  >
                                    Editar
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
