import React, { useEffect } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated'
import { WheelSegments } from './WheelSegments'
import { WheelActivity, calculateWinnerRotation, getRandomExtraSpins } from '@/lib/wheel-logic'

interface WheelSpinnerProps {
  activities: WheelActivity[]
  isSpinning: boolean
  winner: WheelActivity | null
  onSpinComplete?: () => void
}

const WHEEL_SIZE = Math.min(Dimensions.get('window').width - 40, 350)

/**
 * Animated spinning wheel with colored segments
 * Spins with realistic physics and lands on winner
 */
export function WheelSpinner({
  activities,
  isSpinning,
  winner,
  onSpinComplete,
}: WheelSpinnerProps) {
  const rotation = useSharedValue(0)

  useEffect(() => {
    if (isSpinning && winner && activities.length > 0) {
      const winnerIndex = activities.findIndex((a) => a.id === winner.id)
      
      if (winnerIndex === -1) {
        onSpinComplete?.()
        return
      }

      const extraSpins = getRandomExtraSpins()
      const targetRotation = calculateWinnerRotation(winnerIndex, activities.length, extraSpins)

      // Reset to 0 first
      rotation.value = 0

      // Spin with easing
      rotation.value = withTiming(
        targetRotation,
        {
          duration: 5000, // 5 seconds
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Ease out cubic for deceleration effect
        },
        (finished) => {
          if (finished) {
            onSpinComplete?.()
          }
        }
      )
    }
  }, [isSpinning, winner, activities, onSpinComplete])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    }
  })

  if (activities.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.wheelContainer, animatedStyle]}>
        <WheelSegments activities={activities} rotation={0} size={WHEEL_SIZE} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  wheelContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: '#FFFFFF',
  },
})
