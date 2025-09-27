

import { Metadata } from 'next'
import { AIResolutionTester } from '@/components/crm/ai-resolution-tester'

export const metadata: Metadata = {
  title: 'Pruebas de IA | COMODÍN IA',
  description: 'Prueba y evalúa el rendimiento de la IA resolutiva con Knowledge Base'
}

export default function AITestingPage() {
  return (
    <div className="container mx-auto p-6">
      <AIResolutionTester />
    </div>
  )
}
