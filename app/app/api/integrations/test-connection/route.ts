
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { integrationName, authData } = body

    if (!integrationName || !authData) {
      return NextResponse.json(
        { success: false, error: 'Datos de prueba incompletos' },
        { status: 400 }
      )
    }

    // Simular prueba de conexión
    // En una implementación real, aquí se haría la llamada real a la API externa
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Por ahora, simulamos que todas las conexiones son exitosas
    const isSuccessful = Math.random() > 0.2 // 80% de éxito

    if (isSuccessful) {
      return NextResponse.json({
        success: true,
        message: 'Conexión establecida correctamente'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Error al conectar con el servicio externo'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error testing connection:', error)
    return NextResponse.json(
      { success: false, error: 'Error al probar la conexión' },
      { status: 500 }
    )
  }
}
