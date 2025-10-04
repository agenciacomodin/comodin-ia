
'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Smartphone, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Infinity,
  FileCheck,
  MessageSquare,
  Image,
  Video,
  AudioLines,
  AlertTriangle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CampaignType } from '@/lib/types'

interface WhatsAppCampaignSelectorProps {
  selectedType?: CampaignType
  onTypeSelect: (type: CampaignType) => void
  className?: string
}

export function WhatsAppCampaignSelector({ 
  selectedType, 
  onTypeSelect, 
  className 
}: WhatsAppCampaignSelectorProps) {

  const whatsappTypes = [
    {
      type: 'WHATSAPP_BUSINESS' as CampaignType,
      title: 'WhatsApp Business',
      subtitle: 'Para uso básico y pruebas',
      icon: Smartphone,
      color: 'green',
      features: [
        { icon: Clock, text: 'Máximo 40 mensajes por día', type: 'limit' },
        { icon: MessageSquare, text: 'Cualquier mensaje de texto', type: 'feature' },
        { icon: Image, text: 'Imágenes y multimedia', type: 'feature' },
        { icon: Video, text: 'Videos y audios', type: 'feature' },
        { icon: XCircle, text: 'Sin plantillas verificadas', type: 'feature' },
        { icon: CheckCircle, text: 'Configuración rápida', type: 'feature' }
      ],
      recommended: 'Ideal para empresas pequeñas, pruebas y mensajes personalizados',
      limitations: [
        'Limitado a 40 mensajes por día',
        'No escalable para campañas masivas',
        'Dependiente de cuenta WhatsApp Business'
      ],
      pricing: 'Gratuito con WhatsApp Business'
    },
    {
      type: 'WHATSAPP_API' as CampaignType,
      title: 'WhatsApp API',
      subtitle: 'Para campañas profesionales masivas',
      icon: Zap,
      color: 'blue',
      features: [
        { icon: Infinity, text: 'Mensajes ilimitados', type: 'feature' },
        { icon: FileCheck, text: 'Solo plantillas verificadas', type: 'requirement' },
        { icon: MessageSquare, text: 'Mensajes estructurados', type: 'feature' },
        { icon: Image, text: 'Multimedia en plantillas', type: 'feature' },
        { icon: Zap, text: 'Envío de alta velocidad', type: 'feature' },
        { icon: CheckCircle, text: 'Webhooks y confirmaciones', type: 'feature' }
      ],
      recommended: 'Perfecto para campañas masivas, notificaciones y marketing a escala',
      limitations: [
        'Requiere plantillas pre-aprobadas por Meta',
        'Proceso de verificación más complejo',
        'Costos por mensaje enviado'
      ],
      pricing: 'Pago por mensaje según tarifa de Meta'
    }
  ]

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Selecciona el Tipo de Campaña de WhatsApp
        </h3>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
          Elige entre WhatsApp Business para mensajes básicos o WhatsApp API para campañas masivas profesionales
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {whatsappTypes.map((campaign) => {
          const isSelected = selectedType === campaign.type
          const IconComponent = campaign.icon

          return (
            <Card
              key={campaign.type}
              className={cn(
                "cursor-pointer border-2 transition-all duration-200 hover:shadow-lg",
                isSelected 
                  ? campaign.color === 'green'
                    ? 'border-green-500 bg-green-50 shadow-green-100 shadow-lg'
                    : 'border-blue-500 bg-blue-50 shadow-blue-100 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              )}
              onClick={() => onTypeSelect(campaign.type)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      campaign.color === 'green' ? 'bg-green-100' : 'bg-blue-100'
                    )}>
                      <IconComponent className={cn(
                        "h-6 w-6",
                        campaign.color === 'green' ? 'text-green-600' : 'text-blue-600'
                      )} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{campaign.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {campaign.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Badge 
                    variant={campaign.color === 'green' ? 'default' : 'outline'}
                    className={cn(
                      campaign.color === 'green' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    )}
                  >
                    {campaign.pricing}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Características principales */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">Características:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {campaign.features.map((feature, index) => {
                      const FeatureIcon = feature.icon
                      return (
                        <div key={index} className="flex items-center space-x-2">
                          <FeatureIcon className={cn(
                            "h-4 w-4",
                            feature.type === 'limit' ? 'text-orange-500' :
                            feature.type === 'requirement' ? 'text-blue-500' :
                            'text-green-500'
                          )} />
                          <span className="text-sm text-gray-600">{feature.text}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Recomendación */}
                <Alert className={cn(
                  campaign.color === 'green' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-blue-50 border-blue-200'
                )}>
                  <Info className={cn(
                    "h-4 w-4",
                    campaign.color === 'green' ? 'text-green-600' : 'text-blue-600'
                  )} />
                  <AlertDescription className="text-sm">
                    <strong>Recomendado:</strong> {campaign.recommended}
                  </AlertDescription>
                </Alert>

                {/* Limitaciones */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">Limitaciones:</h4>
                  <ul className="space-y-1">
                    {campaign.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "w-full",
                    isSelected && campaign.color === 'green' && "bg-green-600 hover:bg-green-700",
                    isSelected && campaign.color === 'blue' && "bg-blue-600 hover:bg-blue-700"
                  )}
                  onClick={() => onTypeSelect(campaign.type)}
                >
                  {isSelected ? 'Seleccionado' : `Seleccionar ${campaign.title}`}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Información adicional */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-900">Información Importante:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• <strong>WhatsApp Business:</strong> Perfecto para empresas que necesitan comunicación personalizada con límites bajos de volumen.</li>
              <li>• <strong>WhatsApp API:</strong> Diseñado para empresas que requieren envíos masivos con plantillas pre-aprobadas por Meta.</li>
              <li>• Ambas opciones soportan multimedia (imágenes, videos, audios) según las políticas de WhatsApp.</li>
              <li>• Las plantillas de WhatsApp API deben ser aprobadas por Meta antes de usarse en campañas.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
