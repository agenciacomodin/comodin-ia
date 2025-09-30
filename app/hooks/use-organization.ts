
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface Organization {
  id: string
  name: string
  slug: string
  domain?: string
  logoUrl?: string
  settings?: any
}

export function useOrganization() {
  const { data: session } = useSession()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrganization = useCallback(async () => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/organizations/current')
      if (!response.ok) {
        throw new Error('Error al cargar organización')
      }
      
      const data = await response.json()
      setOrganization(data.organization)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchOrganization()
  }, [fetchOrganization])

  return {
    organization,
    loading,
    error,
    refetch: fetchOrganization
  }
}
