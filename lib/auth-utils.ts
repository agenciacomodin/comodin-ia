
import { db } from './db';
import { Organization, User } from '@prisma/client';

export interface OrganizationWithUsers extends Organization {
  users: User[];
}

// Obtener organización con usuarios por email de usuario
export async function getUserOrganization(userEmail: string): Promise<OrganizationWithUsers | null> {
  try {
    const user = await db.user.findUnique({
      where: { email: userEmail },
      include: {
        organization: {
          include: {
            users: true
          }
        }
      }
    });

    if (!user || !user.organization) {
      return null;
    }

    return user.organization;
  } catch (error) {
    console.error('Error getting user organization:', error);
    return null;
  }
}

// Verificar si el usuario tiene un rol específico
export async function userHasRole(userEmail: string, roles: string[]): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { email: userEmail },
      select: { role: true }
    });

    return user ? roles.includes(user.role) : false;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

// Obtener usuario por email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    return await db.user.findUnique({
      where: { email }
    });
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}
