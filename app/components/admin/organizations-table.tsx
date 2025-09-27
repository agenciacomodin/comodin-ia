
'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RoleBadge } from '@/components/hierarchy/role-badge'
import { 
  Search, 
  Eye, 
  Edit, 
  Users, 
  MoreHorizontal,
  Plus
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Organization {
  id: string
  name: string
  slug: string
  status: string
  createdAt: string
  userCount: number
  users?: Array<{
    id: string
    name: string
    email: string
    role: string
    isActive: boolean
    lastLogin?: string
  }>
  description?: string
  email?: string
  phone?: string
  country?: string
}

interface OrganizationsResponse {
  organizations: Organization[]
  total: number
  userRole: string
}

export function OrganizationsTable() {
  const [data, setData] = useState<OrganizationsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrganizations = data?.organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.slug.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || org.status === selectedStatus
    return matchesSearch && matchesStatus
  }) ?? []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>
      case 'TRIAL':
        return <Badge className="bg-blue-100 text-blue-800">Prueba</Badge>
      case 'SUSPENDED':
        return <Badge className="bg-red-100 text-red-800">Suspendido</Badge>
      case 'INACTIVE':
        return <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-sm text-gray-500">Cargando organizaciones...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Organizaciones</CardTitle>
            <CardDescription>
              Gestiona todas las organizaciones de la plataforma
            </CardDescription>
          </div>
          {data?.userRole === 'SUPER_ADMIN' && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Organización
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar organizaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded-md px-3 py-2 bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="TRIAL">Prueba</option>
            <option value="SUSPENDED">Suspendido</option>
            <option value="INACTIVE">Inactivo</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organización</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold">{org.name}</div>
                      <div className="text-sm text-gray-500">/{org.slug}</div>
                      {org.description && (
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {org.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getStatusBadge(org.status)}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{org.userCount}</span>
                      {org.users && (
                        <div className="flex -space-x-1 ml-2">
                          {org.users.slice(0, 3).map((user) => (
                            <div
                              key={user.id}
                              className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white border-2 border-white"
                              title={user.name || user.email}
                            >
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {org.users.length > 3 && (
                            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600 border-2 border-white">
                              +{org.users.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(org.createdAt), 'dd MMM yyyy', { locale: es })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(org.createdAt), 'HH:mm')}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Resumen */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredOrganizations.length} de {data?.total || 0} organizaciones
        </div>
      </CardContent>
    </Card>
  )
}
