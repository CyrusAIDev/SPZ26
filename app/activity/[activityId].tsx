import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { useSupabase } from '@/hooks/useSupabase'
import { getActivityWithRatings, deleteActivity, getUserRating } from '@/lib/supabase-helpers'
import { StarRating } from '@/app/components/ui/StarRating'
import { RatingCard } from '@/app/components/RatingCard'
import { RateActivityModal } from '@/app/components/RateActivityModal'
import { ActivityRating } from '@/types/database.types'

export default function ActivityDetailScreen() {
  const { activityId } = useLocalSearchParams<{ activityId: string }>()
  const router = useRouter()
  const { supabase, session } = useSupabase()

  const [loading, setLoading] = useState(true)
  const [activity, setActivity] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [userRating, setUserRating] = useState<ActivityRating | null>(null)

  useFocusEffect(
    useCallback(() => {
      loadActivity()
    }, [activityId])
  )

  const loadActivity = async () => {
    if (!activityId) {
      setError('Invalid activity ID')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: activityError } = await getActivityWithRatings(supabase, activityId)
      
      if (activityError || !data) {
        throw activityError || new Error('Activity not found')
      }

      setActivity(data)

      // Load user's rating
      if (session?.user?.id) {
        const { data: rating } = await getUserRating(supabase, activityId, session.user.id)
        setUserRating(rating)
      }
    } catch (err: any) {
      console.error('Load activity error:', err)
      setError(err.message || 'Failed to load activity')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    )
  }

  const confirmDelete = async () => {
    if (!activityId) return

    try {
      setDeleting(true)

      const { error: deleteError } = await deleteActivity(supabase, activityId)

      if (deleteError) {
        throw deleteError
      }

      // Success - navigate back
      router.back()
    } catch (error: any) {
      console.error('Delete activity error:', error)
      Alert.alert('Error', error.message || 'Failed to delete activity')
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = () => {
    router.push(`/activity/edit/${activityId}`)
  }

  const isCreator = session?.user?.id === activity?.created_by
  
  const handleRatingSuccess = () => {
    loadActivity()
  }

  const handleOpenRating = () => {
    setShowRatingModal(true)
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading activity...</Text>
      </View>
    )
  }

  if (error || !activity) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Activity Not Found</Text>
        <Text style={styles.errorMessage}>
          {error || 'This activity does not exist or you do not have access'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadActivity}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const schedule = activity.activity_schedules?.[0]
  const formattedDate = schedule?.start_at
    ? new Date(schedule.start_at).toLocaleString()
    : null

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            {activity.average_rating !== null && (
              <View style={styles.ratingPreview}>
                <StarRating rating={activity.average_rating} size={18} showNumber />
                <Text style={styles.ratingsCount}>
                  ({activity.ratings_count} {activity.ratings_count === 1 ? 'rating' : 'ratings'})
                </Text>
              </View>
            )}
            <Text style={styles.createdBy}>
              By {activity.users?.display_name || 'Unknown'}
            </Text>
            <Text style={styles.createdAt}>
              {new Date(activity.created_at).toLocaleDateString()}
            </Text>
          </View>
          {isCreator && (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEdit}
                disabled={deleting}
              >
                <Text style={styles.actionButtonIcon}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDelete}
                disabled={deleting}
              >
                <Text style={styles.actionButtonIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Details Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailsCard}>
          {activity.notes && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={styles.detailValue}>{activity.notes}</Text>
            </View>
          )}

          {schedule && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Scheduled</Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Include in wheel</Text>
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, activity.include_in_wheel ? styles.badgeActive : styles.badgeInactive]}>
                <Text style={[styles.badgeText, activity.include_in_wheel ? styles.badgeTextActive : styles.badgeTextInactive]}>
                  {activity.include_in_wheel ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionRow} onPress={handleOpenRating}>
            <Text style={styles.actionIcon}>⭐</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>
                {userRating ? 'Update Your Rating' : 'Rate this activity'}
              </Text>
              {userRating && (
                <View style={styles.userRatingPreview}>
                  <StarRating rating={userRating.stars} size={14} />
                </View>
              )}
            </View>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionIcon}>📅</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Schedule it</Text>
              <Text style={styles.actionSubtitle}>Coming soon</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionIcon}>📊</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Add to poll</Text>
              <Text style={styles.actionSubtitle}>Coming soon</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ratings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Ratings {activity.ratings_count > 0 && `(${activity.ratings_count})`}
        </Text>
        {activity.activity_ratings && activity.activity_ratings.length > 0 ? (
          <View style={styles.ratingsListContainer}>
            {activity.activity_ratings.map((rating: any) => (
              <RatingCard
                key={rating.id}
                rating={rating}
                isCurrentUser={rating.user_id === session?.user?.id}
              />
            ))}
          </View>
        ) : (
          <View style={styles.ratingsCard}>
            <Text style={styles.ratingsEmptyIcon}>⭐</Text>
            <Text style={styles.ratingsEmptyTitle}>No ratings yet</Text>
            <Text style={styles.ratingsEmptyText}>
              Be the first to rate this activity
            </Text>
          </View>
        )}
      </View>

      <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Rating Modal */}
      <RateActivityModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        activityId={activityId!}
        activityTitle={activity.title}
        groupId={activity.group_id}
        existingRating={userRating}
        onSuccess={handleRatingSuccess}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonIcon: {
    fontSize: 18,
  },
  activityTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  createdBy: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  createdAt: {
    fontSize: 12,
    color: '#999',
  },
  ratingPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  ratingsCount: {
    fontSize: 14,
    color: '#666',
  },
  userRatingPreview: {
    marginTop: 4,
  },
  actionChevron: {
    fontSize: 24,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  ratingsListContainer: {
    gap: 12,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  badgeContainer: {
    marginTop: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeActive: {
    backgroundColor: '#E8F5E9',
  },
  badgeInactive: {
    backgroundColor: '#F5F5F5',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badgeTextActive: {
    color: '#4CAF50',
  },
  badgeTextInactive: {
    color: '#999',
  },
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  ratingsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingsEmptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  ratingsEmptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  ratingsEmptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 40,
  },
})
