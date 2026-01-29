import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { StarRating } from './ui/StarRating'
import { ActivityRatingWithUser } from '@/types/database.types'

interface RatingCardProps {
  rating: ActivityRatingWithUser
  isCurrentUser?: boolean
}

/**
 * Display a single rating with user info
 */
export function RatingCard({ rating, isCurrentUser = false }: RatingCardProps) {
  const formattedDate = new Date(rating.rated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <View style={[styles.container, isCurrentUser && styles.currentUserContainer]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {rating.users.display_name}
            {isCurrentUser && ' (You)'}
          </Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        <StarRating rating={rating.stars} size={16} />
      </View>
      
      {rating.note && (
        <Text style={styles.note}>{rating.note}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currentUserContainer: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
  },
  note: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
})
