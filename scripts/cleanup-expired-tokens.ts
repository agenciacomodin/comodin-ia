
import { prisma } from '../lib/db'

async function cleanupExpiredTokens() {
  try {
    console.log('🧹 Iniciando limpieza de tokens expirados...')

    // Eliminar tokens de recuperación de contraseña expirados
    const deletedPasswordTokens = await prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } }, // Tokens expirados
          { used: true } // Tokens ya usados
        ]
      }
    })

    console.log(`✅ Eliminados ${deletedPasswordTokens.count} tokens de recuperación de contraseña`)

    // Eliminar sesiones QR expiradas
    const deletedQRSessions = await prisma.qRSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } }, // Sesiones QR expiradas
          { status: 'EXPIRED' },
          { status: 'AUTHENTICATED' } // Sesiones ya autenticadas
        ]
      }
    })

    console.log(`✅ Eliminadas ${deletedQRSessions.count} sesiones QR expiradas`)

    // Limpiar invitaciones expiradas
    const deletedInvitations = await prisma.invitation.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } }, // Invitaciones expiradas
          { status: 'EXPIRED' },
          { status: 'CANCELLED' }
        ]
      }
    })

    console.log(`✅ Eliminadas ${deletedInvitations.count} invitaciones expiradas`)

    // Limpiar cache de análisis de IA expirado
    const deletedCacheEntries = await prisma.aIAnalysisCache.deleteMany({
      where: {
        AND: [
          { expiresAt: { not: null } },
          { expiresAt: { lt: new Date() } }
        ]
      }
    })

    console.log(`✅ Eliminadas ${deletedCacheEntries.count} entradas de cache de IA expiradas`)

    // Actualizar estadísticas de uso
    const totalCleanedItems = deletedPasswordTokens.count + deletedQRSessions.count + deletedInvitations.count + deletedCacheEntries.count

    console.log(`🎉 Limpieza completada: ${totalCleanedItems} elementos eliminados en total`)

    return {
      success: true,
      deletedPasswordTokens: deletedPasswordTokens.count,
      deletedQRSessions: deletedQRSessions.count,
      deletedInvitations: deletedInvitations.count,
      deletedCacheEntries: deletedCacheEntries.count,
      totalDeleted: totalCleanedItems
    }

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanupExpiredTokens()
    .then(result => {
      if (result.success) {
        console.log('✅ Script de limpieza ejecutado exitosamente')
        process.exit(0)
      } else {
        console.error('❌ Error en el script de limpieza:', result.error)
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('❌ Error fatal:', error)
      process.exit(1)
    })
}

export { cleanupExpiredTokens }
