
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { InvitationStatus } from '@prisma/client'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Invitation {
  id: string
  email: string
  role: string
  status: InvitationStatus
  firstName?: string | null
  lastName?: string | null
  invitedByName: string
  createdAt: string
  expiresAt: string
  acceptedAt?: string | null
}

interface InvitationsListProps {
  onInvite?: () => void
}

export function InvitationsList({ onInvite }: InvitationsListProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [invitationToCancel, setInvitationToCancel] = useState<string | null>(null)

  const loadInvitations = async () => {
    try {
      const response = await fetch('/api/invitations')
      const data = await response.json()

      if (response.ok) {
        setInvitations(data.invitations || [])
      } else {
        throw new Error(data.error || 'Error cargando invitaciones')
      }
    } catch (error) {
      console.error('❌ Error cargando invitaciones:', error)
      toast.error('Error cargando las invitaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInvitations()
  }, [])

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}/cancel`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error cancelando invitación')
      }

      toast.success('Invitación cancelada')
      loadInvitations() // Recargar lista
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      toast.error(message)
    }
  }

  const getStatusBadge = (status: InvitationStatus, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date()
    
    if (isExpired && status === InvitationStatus.PENDING) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Expirada</Badge>
    }

    switch (status) {
      case InvitationStatus.PENDING:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case InvitationStatus.ACCEPTED:
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Aceptada</Badge>
      case InvitationStatus.CANCELLED:
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Cancelada</Badge>
      case InvitationStatus.EXPIRED:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Expirada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Invitaciones del equipo
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona las invitaciones enviadas a nuevos agentes
              </p>
            </div>
            <Button 
              onClick={onInvite}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Nueva invitación
            </Button>
          </div>
        </div>

        <div className="p-6">
          {invitations.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-5xl mb-4">📧</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No hay invitaciones
              </h4>
              <p className="text-gray-600 mb-4">
                Comienza invitando a tu primer agente de ventas
              </p>
              <Button 
                onClick={onInvite}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Enviar primera invitación
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => {
                const isExpired = new Date(invitation.expiresAt) < new Date()
                const canCancel = invitation.status === InvitationStatus.PENDING && !isExpired
                
                return (
                  <div key={invitation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {invitation.firstName && invitation.lastName
                                ? `${invitation.firstName} ${invitation.lastName}`
                                : invitation.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              {invitation.firstName && invitation.lastName && (
                                <>
                                  {invitation.email} • 
                                </>
                              )}
                              Rol: Agente
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            Enviada {formatDistanceToNow(new Date(invitation.createdAt), {
                              addSuffix: true,
                              locale: es
                            })}
                          </span>
                          
                          {invitation.status === InvitationStatus.PENDING && (
                            <span>
                              Expira {formatDistanceToNow(new Date(invitation.expiresAt), {
                                addSuffix: true,
                                locale: es
                              })}
                            </span>
                          )}
                          
                          {invitation.acceptedAt && (
                            <span className="text-green-600">
                              Aceptada {formatDistanceToNow(new Date(invitation.acceptedAt), {
                                addSuffix: true,
                                locale: es
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {getStatusBadge(invitation.status, invitation.expiresAt)}
                        
                        {canCancel && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setInvitationToCancel(invitation.id)
                              setCancelDialogOpen(true)
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar invitación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La invitación será cancelada y el enlace dejará de funcionar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mantener</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (invitationToCancel) {
                  handleCancelInvitation(invitationToCancel)
                }
                setCancelDialogOpen(false)
                setInvitationToCancel(null)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancelar invitación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
