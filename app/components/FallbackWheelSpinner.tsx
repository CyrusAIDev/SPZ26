import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { WheelActivity } from '@/lib/wheel-logic'

interface FallbackWheelSpinnerProps {
  activities: WheelActivity[]
  isSpinning: boolean
  winner: WheelActivity | null
  onSpinComplete?: () => void
}

/**
 * Fallback wheel spinner for Expo Go
 * Shows a simple list-based selector instead of animated wheel
 * This allows testing wheel logic without reanimated
 */
export function FallbackWheelSpinner({
  activities,
  isSpinning,
  winner,
  onSpinComplete,
}: FallbackWheelSpinnerProps) {
  
  React.useEffect(() => {
    if (isSpinning && winner) {
      // Simulate spin delay
      setTimeout(() => {
        onSpinComplete?.()
      }, 1000)
    }
  }, [isSpinning, winner, onSpinComplete])

  if (activities.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🎲 Simple Wheel Mode</Text>
        <Text style={styles.subtitle}>
          Running in Expo Go - animated wheel requires development build
        </Text>
        
        {isSpinning ? (
          <View style={styles.spinningContainer}>
            <Text style={styles.spinningText}>Selecting...</Text>
          </View>
        ) : winner ? (
          <View style={styles.winnerContainer}>
            <Text style={styles.winnerLabel}>Winner:</Text>
            <Text style={styles.winnerText}>{winner.title}</Text>
          </View>
        ) : (
          <View style={styles.activitiesList}>
            <Text style={styles.listTitle}>Activities in wheel:</Text>
            {activities.map((activity, index) => (
              <View key={activity.id} style={styles.activityItem}>
                <Text style={styles.activityNumber}>{index + 1}</Text>
                <Text style={styles.activityTitle}>{activity.title}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity 
          style={styles.buildButton}
          onPress={() => {
            Alert.alert(
              'Get Animated Wheel',
              'To see the full spinning wheel animation, you need to create a development build:\n\n1. Run: npx expo run:ios\n2. Wait 5-10 minutes\n3. Enjoy smooth animations!\n\nThe wheel logic works the same, you just get better visuals.',
              [{ text: 'OK' }]
            )
          }}
        >
          <Text style={styles.buildButtonText}>
            ℹ️ How to get animated wheel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  spinningContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  spinningText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3B82F6',
  },
  winnerContainer: {
    paddingVertical: 30,
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    marginBottom: 16,
  },
  winnerLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  winnerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
  },
  activitiesList: {
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 6,
  },
  activityNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
    marginRight: 12,
    width: 24,
  },
  activityTitle: {
    fontSize: 15,
    color: '#111827',
    flex: 1,
  },
  buildButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  buildButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
})
