
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar,
  Send,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle,
  Settings
} from 'lucide-react'

interface CampaignStatsExtendedProps {
  campaign: any
}

export default function CampaignStatsExtended({ campaign }: CampaignStatsExtendedProps) {
  const deliveryRate = campaign.totalRecipients > 0 
    ? (campaign.messagesDelivered / campaign.totalRecipients) * 100 
    : 0

  const readRate = campaign.messagesDelivered > 0 
    ? (campaign.messagesRead / campaign.messagesDelivered) * 100 
    : 0

  const failureRate = campaign.totalRecipients > 0 
    ? (campaign.messagesFailed / campaign.totalRecipients) * 100 
    : 0

  const completionRate = campaign.totalRecipients > 0 
    ? (campaign.messagesSent / campaign.totalRecipients) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* Estadísticas Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviados</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.messagesSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              de {campaign.totalRecipients.toLocaleString()} total
            </p>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {campaign.messagesDelivered.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {deliveryRate.toFixed(1)}% de entrega
            </p>
            <Progress value={deliveryRate} className="mt-2 bg-green-100" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leídos</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {campaign.messagesRead.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {readRate.toFixed(1)}% de lectura
            </p>
            <Progress value={readRate} className="mt-2 bg-blue-100" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fallidos</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {campaign.messagesFailed.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {failureRate.toFixed(1)}% de fallos
            </p>
            <Progress value={failureRate} className="mt-2 bg-red-100" />
          </CardContent>
        </Card>
      </div>

      {/* Configuración de Campaña Extendida */}
      {(campaign.channelType || campaign.campaignDurationDays || campaign.messagesPerDay) && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Configuración de Campaña Extendida</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {campaign.channelType && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">Canal</span>
                  </div>
                  <Badge variant="secondary" className="text-sm font-medium">
                    {campaign.channelType === 'whatsapp_api' ? 'WhatsApp API' :
                     campaign.channelType === 'whatsapp_business' ? 'WhatsApp Business' :
                     campaign.channelType === 'email' ? 'Email' :
                     campaign.channelType === 'sms' ? 'SMS' : campaign.channelType}
                  </Badge>
                </div>
              )}

              {campaign.campaignDurationDays && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Duración</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {campaign.campaignDurationDays} días
                  </p>
                </div>
              )}

              {campaign.messagesPerDay && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Send className="h-4 w-4" />
                    <span className="text-sm">Mensajes/día</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {campaign.messagesPerDay.toLocaleString()}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">Velocidad</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {campaign.sendRate} msg/min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de Costos y Tiempos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Estimado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${campaign.estimatedCost ? campaign.estimatedCost.toFixed(2) : '0.00'}
            </div>
            {campaign.actualCost && (
              <p className="text-xs text-muted-foreground">
                Real: ${campaign.actualCost.toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Estimado</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaign.totalRecipients && campaign.sendRate 
                ? `${Math.ceil(campaign.totalRecipients / campaign.sendRate)}min`
                : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              Para completar envío
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alcance Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaign.targetAudienceSize.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Contactos objetivo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline de Campaña */}
      {(campaign.startedAt || campaign.completedAt || campaign.scheduledFor) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Timeline de Campaña</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaign.scheduledFor && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Programada para</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(campaign.scheduledFor).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              )}

              {campaign.startedAt && (
                <div className="flex items-center space-x-3">
                  <Zap className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Iniciada</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(campaign.startedAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              )}

              {campaign.completedAt && (
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Completada</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(campaign.completedAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              )}

              {campaign.pausedAt && (
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Pausada</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(campaign.pausedAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensaje de Error si existe */}
      {campaign.lastError && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>Último Error</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{campaign.lastError}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Errores totales: {campaign.errorCount}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
