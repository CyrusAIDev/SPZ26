import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { StarRating } from './ui/StarRating'

interface CalendarActivityCardProps {
  schedule: {
    id: string
    start_at: string
    activity_id: string
    activities: {
      id: string
      title: string
      groups: {
        id: string
        name: string
      }
    }
    average_rating?: number | null
    ratings_count?: number
  }
  showGroup?: boolean
}

/**
 * Compact activity card for calendar view
 */
export function CalendarActivityCard({ schedule, showGroup = true }: CalendarActivityCardProps) {
  const router = useRouter()
  const activity = schedule.activities

  const handlePress = () => {
    router.push(`/activity/${activity.id}`)
  }

  // Format time from ISO string
  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(schedule.start_at)}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {activity.title}
        </Text>
        
        {showGroup && (
          <Text style={styles.groupName} numberOfLines={1}>
            {activity.groups.name}
          </Text>
        )}
        
        {schedule.average_rating !== null && schedule.average_rating !== undefined && (
          <View style={styles.ratingContainer}>
            <StarRating rating={schedule.average_rating} size={14} />
            <Text style={styles.ratingCount}>({schedule.ratings_count})</Text>
          </View>
        )}
      </View>
      
      <View style={styles.chevron}>
        <Text style={styles.chevronText}>›</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timeContainer: {
    width: 70,
    marginRight: 12,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingCount: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  chevron: {
    marginLeft: 8,
  },
  chevronText: {
    fontSize: 24,
    color: '#9CA3AF',
  },
})
