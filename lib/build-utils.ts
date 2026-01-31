import Constants from 'expo-constants'

/**
 * Detect if running in Expo Go or Development Build
 * Expo Go: appOwnership === 'expo'
 * Development Build: appOwnership === undefined
 */
export function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo'
}

export function isDevelopmentBuild(): boolean {
  return Constants.appOwnership === undefined || Constants.appOwnership === 'standalone'
}

/**
 * Check if advanced animations (reanimated 4.x) are available
 * Only available in development builds, not in Expo Go
 */
export function hasAdvancedAnimations(): boolean {
  return isDevelopmentBuild()
}
