
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Users, Zap, Shield, Globe, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">COMODÍN IA</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Registrar Empresa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Unifica tu comunicación y
            <span className="text-blue-600"> ventas con IA</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            La plataforma todo-en-uno que conecta WhatsApp, CRM y automatización inteligente 
            para PyMEs latinoamericanas que buscan crecer y optimizar sus procesos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                Comenzar Gratis
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="px-8 py-3">
                Acceder a mi Cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Todo lo que necesitas en una plataforma
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Gestiona clientes, automatiza conversaciones y aumenta tus ventas desde un solo lugar
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle className="text-xl">WhatsApp Integrado</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Conecta múltiples números de WhatsApp y gestiona todas las conversaciones desde una interfaz unificada.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle className="text-xl">CRM Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Organiza contactos, historial de conversaciones y pipeline de ventas con información contextual automática.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="h-12 w-12 text-yellow-600 mb-4" />
              <CardTitle className="text-xl">Automatización IA</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Respuestas automáticas inteligentes, clasificación de consultas y seguimiento proactivo de leads.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-red-600 mb-4" />
              <CardTitle className="text-xl">Multi-tenant Seguro</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Aislamiento total de datos entre organizaciones con roles de usuario granulares y seguridad empresarial.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <Globe className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle className="text-xl">Para Latinoamérica</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Diseñado específicamente para PyMEs latinoamericanas con soporte multiidioma y moneda local.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle className="text-xl">Analytics Avanzados</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Métricas en tiempo real, reportes de conversión y análisis de rendimiento para optimizar resultados.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para transformar tu negocio?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a cientos de empresas que ya están creciendo con COMODÍN IA
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
              Comenzar Ahora - Es Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <MessageSquare className="h-6 w-6" />
              <span className="text-lg font-semibold">COMODÍN IA</span>
            </div>
            <div className="text-gray-400">
              © 2025 COMODÍN IA. Transformando PyMEs latinoamericanas.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
