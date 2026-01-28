import { useEffect } from 'react'
import { Redirect } from 'expo-router'
import { useSupabase } from '@/hooks/useSupabase'

/**
 * Root index - handles initial routing
 * Redirects to appropriate screen based on auth state
 */
export default function Index() {
  const { isLoaded, session } = useSupabase()

  // Wait for auth to load before redirecting
  if (!isLoaded) {
    return null
  }

  // If user has a session, go to protected area
  if (session) {
    return <Redirect href="/(protected)/(tabs)" />
  }

  // No session - go to welcome screen
  return <Redirect href="/(public)/welcome" />
}
