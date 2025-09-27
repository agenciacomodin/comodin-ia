
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RoleBadge } from '@/components/hierarchy/role-badge'
import { HierarchyGuard } from '@/components/hierarchy/hierarchy-guard'
import { Organization, User, UserRole } from '@prisma/client'
import { 
  Shield, 
  Building2, 
  Users, 
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  Settings,
  Eye
} from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface TeamMember {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  lastLogin?: Date
  avatar?: string
  organizationId: string
  organizationName: string
}

interface TeamHierarchyViewProps {
  organization: Organization
  members: TeamMember[]
  currentUserRole: UserRole
}

export function TeamHierarchyView({ 
  organization, 
  members, 
  currentUserRole 
}: TeamHierarchyViewProps) {
  const [expandedRoles, setExpandedRoles] = useState<Set<UserRole>>(new Set(['PROPIETARIO']))

  // Agrupar miembros por rol
  const membersByRole = members.reduce((acc, member) => {
    if (!acc[member.role]) {
      acc[member.role] = []
    }
    acc[member.role].push(member)
    return acc
  }, {} as Record<UserRole, TeamMember[]>)

  // Orden de jerarquía para mostrar
  const roleOrder: UserRole[] = ['SUPER_ADMIN', 'DISTRIBUIDOR', 'PROPIETARIO', 'AGENTE']

  const toggleRoleExpansion = (role: UserRole) => {
    const newExpanded = new Set(expandedRoles)
    if (newExpanded.has(role)) {
      newExpanded.delete(role)
    } else {
      newExpanded.add(role)
    }
    setExpandedRoles(newExpanded)
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN': return Shield
      case 'DISTRIBUIDOR': return Building2
      case 'PROPIETARIO': return Users
      case 'AGENTE': return MessageCircle
      default: return Users
    }
  }

  const canManageRole = (managerRole: UserRole, targetRole: UserRole): boolean => {
    const hierarchy = {
      SUPER_ADMIN: 4,
      DISTRIBUIDOR: 3,
      PROPIETARIO: 2,
      AGENTE: 1
    }
    return hierarchy[managerRole] >= hierarchy[targetRole]
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Jerarquía de Equipo
            </CardTitle>
            <CardDescription>
              Estructura organizacional de {organization.name}
            </CardDescription>
          </div>
          <HierarchyGuard allowedRoles={['SUPER_ADMIN', 'DISTRIBUIDOR', 'PROPIETARIO']}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Invitar Usuario
            </Button>
          </HierarchyGuard>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {roleOrder.map((role) => {
          const roleMembers = membersByRole[role] || []
          if (roleMembers.length === 0) return null

          const IconComponent = getRoleIcon(role)
          const isExpanded = expandedRoles.has(role)

          return (
            <div key={role} className="border rounded-lg overflow-hidden">
              {/* Header del rol */}
              <div 
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleRoleExpansion(role)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                  <IconComponent className="h-5 w-5" />
                  <RoleBadge role={role} size="md" />
                  <Badge variant="outline" className="text-xs">
                    {roleMembers.length} {roleMembers.length === 1 ? 'miembro' : 'miembros'}
                  </Badge>
                </div>
                
                <HierarchyGuard targetUserRole={role} showError={false} fallback={null}>
                  <div className="flex items-center gap-2">
                    {canManageRole(currentUserRole, role) && (
                      <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                        <Settings className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </HierarchyGuard>
              </div>

              {/* Lista de miembros */}
              {isExpanded && (
                <div className="divide-y">
                  {roleMembers.map((member) => (
                    <div key={member.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {(member.name || member.email).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h4 className="font-semibold text-sm">{member.name || 'Sin nombre'}</h4>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={member.isActive ? 'default' : 'secondary'} className="text-xs">
                              {member.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                            {member.lastLogin && (
                              <span className="text-xs text-gray-500">
                                Último acceso: {format(member.lastLogin, 'dd MMM', { locale: es })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <HierarchyGuard targetUserRole={member.role} showError={false} fallback={null}>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canManageRole(currentUserRole, member.role) && (
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </HierarchyGuard>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Resumen de la jerarquía */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Resumen de Jerarquía</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>Total de miembros:</strong> {members.length}</p>
            <p>• <strong>Usuarios activos:</strong> {members.filter(m => m.isActive).length}</p>
            <p>• <strong>Nivel de organización:</strong> {organization.status}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
