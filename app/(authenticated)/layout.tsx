
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { redirect } from 'next/navigation'
import { MainSidebar } from '@/components/layout/main-sidebar'
import { MainHeader } from '@/components/layout/main-header'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await getCurrentOrganization()
  } catch (error) {
    redirect('/auth/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <MainSidebar />
      
      {/* Área de contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <MainHeader />
        
        {/* Contenido */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
