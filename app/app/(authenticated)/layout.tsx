
import { getCurrentOrganization } from '@/lib/multi-tenant'
import { redirect } from 'next/navigation'
import { OptimizedSidebar } from '@/components/layout/optimized-sidebar'
import { OptimizedHeader } from '@/components/layout/optimized-header'
import { OnboardingTour } from '@/components/onboarding/onboarding-tour'

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
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block">
        <OptimizedSidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <OptimizedHeader />
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour />
    </div>
  )
}
