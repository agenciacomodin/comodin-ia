
'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null // Evitar hidration mismatch
  }

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
