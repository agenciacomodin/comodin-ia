
/**
 * Sistema de jerarquía de equipos para COMODÍN IA
 * Define las relaciones y niveles de acceso entre roles
 */

import { UserRole, Organization } from '@prisma/client'
import { ExtendedUser } from './auth'
import { Permission } from './permissions'

// Definición de la jerarquía de roles (de mayor a menor poder)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 4,      // Nivel máximo - acceso total a la plataforma
  DISTRIBUIDOR: 3,     // Gestiona múltiples organizaciones cliente
  PROPIETARIO: 2,      // Administra su organización
  AGENTE: 1            // Nivel básico - solo conversaciones asignadas
}

// Tipos de acceso según la jerarquía
export enum AccessLevel {
  PLATFORM = 'PLATFORM',           // Acceso a toda la plataforma (Super Admin)
  MULTI_TENANT = 'MULTI_TENANT',   // Acceso a múltiples organizaciones (Distribuidor)
  ORGANIZATION = 'ORGANIZATION',    // Acceso a una organización (Propietario)
  LIMITED = 'LIMITED'               // Acceso limitado (Agente)
}

/**
 * Obtener el nivel de acceso de un rol
 */
export function getAccessLevel(role: UserRole): AccessLevel {
  switch (role) {
    case 'SUPER_ADMIN':
      return AccessLevel.PLATFORM
    case 'DISTRIBUIDOR':
      return AccessLevel.MULTI_TENANT
    case 'PROPIETARIO':
      return AccessLevel.ORGANIZATION
    case 'AGENTE':
    default:
      return AccessLevel.LIMITED
  }
}

/**
 * Verificar si un rol puede gestionar otro rol
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  const managerLevel = ROLE_HIERARCHY[managerRole]
  const targetLevel = ROLE_HIERARCHY[targetRole]
  
  // Un rol puede gestionar roles de nivel igual o inferior
  return managerLevel >= targetLevel
}

/**
 * Verificar si un usuario puede acceder a una organización específica
 */
export function canAccessOrganization(
  user: ExtendedUser, 
  targetOrganizationId: string
): boolean {
  switch (user.role) {
    case 'SUPER_ADMIN':
      // Super Admin puede acceder a cualquier organización
      return true
    
    case 'DISTRIBUIDOR':
      // Por ahora permitimos acceso (se implementará con tabla de relaciones)
      return true
    
    case 'PROPIETARIO':
    case 'AGENTE':
      // Solo pueden acceder a su propia organización
      return user.organizationId === targetOrganizationId
    
    default:
      return false
  }
}

/**
 * Obtener organizaciones accesibles para un usuario
 */
export function getAccessibleOrganizationIds(user: ExtendedUser): string[] | 'ALL' {
  switch (user.role) {
    case 'SUPER_ADMIN':
      return 'ALL'
    
    case 'DISTRIBUIDOR':
      // Por ahora retornamos la propia organización
      return [user.organizationId]
    
    case 'PROPIETARIO':
    case 'AGENTE':
    default:
      return [user.organizationId]
  }
}

/**
 * Filtrar datos según la jerarquía del usuario
 */
export interface DataFilter {
  organizationIds?: string[] | 'ALL'
  userIds?: string[]
  includeSubordinates?: boolean
}

export function getDataFilter(user: ExtendedUser): DataFilter {
  const accessLevel = getAccessLevel(user.role)
  
  switch (accessLevel) {
    case AccessLevel.PLATFORM:
      return {
        organizationIds: 'ALL',
        includeSubordinates: true
      }
    
    case AccessLevel.MULTI_TENANT:
      return {
        organizationIds: getAccessibleOrganizationIds(user) as string[],
        includeSubordinates: true
      }
    
    case AccessLevel.ORGANIZATION:
      return {
        organizationIds: [user.organizationId],
        includeSubordinates: true
      }
    
    case AccessLevel.LIMITED:
    default:
      return {
        organizationIds: [user.organizationId],
        userIds: [user.id], // Solo datos del usuario actual
        includeSubordinates: false
      }
  }
}

/**
 * Obtener roles que un usuario puede asignar
 */
export function getAssignableRoles(userRole: UserRole): UserRole[] {
  switch (userRole) {
    case 'SUPER_ADMIN':
      return ['SUPER_ADMIN', 'DISTRIBUIDOR', 'PROPIETARIO', 'AGENTE']
    
    case 'DISTRIBUIDOR':
      return ['PROPIETARIO', 'AGENTE'] // Solo puede crear/gestionar estos roles
    
    case 'PROPIETARIO':
      return ['AGENTE'] // Solo puede invitar agentes
    
    case 'AGENTE':
    default:
      return [] // No puede asignar roles
  }
}

/**
 * Verificar si un usuario puede realizar una acción específica en una organización
 */
export function canPerformAction(
  user: ExtendedUser,
  action: Permission,
  targetOrganizationId?: string
): boolean {
  // Verificar si el usuario tiene el permiso básico
  const hasPermission = user.permissions?.includes(action) ?? false
  if (!hasPermission) return false
  
  // Si no se especifica organización, usar la del usuario
  const orgId = targetOrganizationId || user.organizationId
  
  // Verificar acceso a la organización
  return canAccessOrganization(user, orgId)
}

/**
 * Obtener el contexto de jerarquía para un usuario
 */
export interface HierarchyContext {
  userRole: UserRole
  accessLevel: AccessLevel
  canManageUsers: boolean
  canCreateOrganizations: boolean
  canViewAllOrganizations: boolean
  assignableRoles: UserRole[]
  dataFilter: DataFilter
}

export function getHierarchyContext(user: ExtendedUser): HierarchyContext {
  const accessLevel = getAccessLevel(user.role)
  
  return {
    userRole: user.role,
    accessLevel,
    canManageUsers: user.permissions?.includes(Permission.MANAGE_USERS) ?? false,
    canCreateOrganizations: user.permissions?.includes(Permission.CREATE_CLIENT_ACCOUNTS) ?? false,
    canViewAllOrganizations: user.permissions?.includes(Permission.VIEW_ALL_ORGANIZATIONS) ?? false,
    assignableRoles: getAssignableRoles(user.role),
    dataFilter: getDataFilter(user)
  }
}

/**
 * Validar si una operación es permitida en el contexto de jerarquía
 */
export function validateHierarchyOperation(
  currentUser: ExtendedUser,
  operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
  resourceType: 'USER' | 'ORGANIZATION' | 'CONVERSATION',
  targetData?: {
    userId?: string
    organizationId?: string
    userRole?: UserRole
  }
): { allowed: boolean; reason?: string } {
  const context = getHierarchyContext(currentUser)
  
  // Validaciones específicas por tipo de recurso
  if (resourceType === 'USER' && targetData?.userRole) {
    if (!canManageRole(currentUser.role, targetData.userRole)) {
      return {
        allowed: false,
        reason: `No tienes permisos para gestionar usuarios con rol ${targetData.userRole}`
      }
    }
  }
  
  if (targetData?.organizationId) {
    if (!canAccessOrganization(currentUser, targetData.organizationId)) {
      return {
        allowed: false,
        reason: 'No tienes acceso a esta organización'
      }
    }
  }
  
  return { allowed: true }
}
