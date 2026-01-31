import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { WheelActivity } from '@/lib/wheel-logic'
import { StarRating } from './ui/StarRating'

interface WheelResultCardProps {
  winner: WheelActivity
  onSpinAgain: () => void
}

/**
 * Result card showing the winning activity with quick actions
 */
export function WheelResultCard({ winner, onSpinAgain }: WheelResultCardProps) {
  const router = useRouter()

  const handleViewDetails = () => {
    router.push(`/activity/${winner.id}`)
  }

  const schedule = winner.activity_schedules?.[0]
  const hasSchedule = !!schedule

  return (
    <View style={styles.container}>
      <Text style={styles.announcement}>🎉 We should...</Text>
      
      <View style={styles.winnerCard}>
        <Text style={styles.winnerTitle}>{winner.title}</Text>
        
        {winner.average_rating !== null && (
          <View style={styles.ratingContainer}>
            <StarRating rating={winner.average_rating} size={20} showNumber />
          </View>
        )}

        {hasSchedule && (
          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleIcon}>📅</Text>
            <Text style={styles.scheduleText}>
              {new Date(schedule.start_at).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleViewDetails}
        >
          <Text style={styles.primaryButtonText}>View Details</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={onSpinAgain}
          >
            <Text style={styles.secondaryButtonText}>🔄 Spin Again</Text>
          </TouchableOpacity>

          {!hasSchedule && (
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleViewDetails}
            >
              <Text style={styles.secondaryButtonText}>📅 Schedule It</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  announcement: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  winnerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#10B981',
    marginBottom: 32,
    alignItems: 'center',
  },
  winnerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    marginBottom: 12,
  },
  scheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  scheduleIcon: {
    fontSize: 16,
  },
  scheduleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
})
