
import { UserRoleTester } from '@/components/admin/user-role-tester'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Pruebas del Sistema - COMODÍN IA Admin',
  description: 'Panel de pruebas para verificar funciones de usuarios y emails'
}

export default function SystemTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span>Panel de Pruebas del Sistema</span>
          </h1>
          <p className="text-gray-600">
            Verifica que todas las funciones de los tipos de usuario y el sistema de emails funcionen correctamente
          </p>
        </div>

        {/* Warning */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-yellow-900">Acceso Solo para Administradores</p>
                <p className="text-sm text-yellow-800">
                  Esta página es solo para verificar el funcionamiento del sistema. 
                  Asegúrate de tener las credenciales de email configuradas correctamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Component */}
        <UserRoleTester />

        {/* Footer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <p className="font-medium">Base de Datos</p>
              <p className="text-sm text-green-600">Conectada</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">🔐</div>
              <p className="font-medium">Autenticación</p>
              <p className="text-sm text-blue-600">QR + Credenciales</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">👥</div>
              <p className="font-medium">Roles</p>
              <p className="text-sm text-purple-600">4 Tipos Configurados</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
