import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { useSupabase } from '@/hooks/useSupabase'
import { getGroupActivities } from '@/lib/supabase-helpers'
import {
  spinWheel,
  isBiasModeAvailable,
  BiasMode,
  WheelActivity,
} from '@/lib/wheel-logic'
import { FallbackWheelSpinner as WheelSpinner } from '@/app/components/FallbackWheelSpinner'
import { WheelResultCard } from '@/app/components/WheelResultCard'
import { BiasModeSelector } from '@/app/components/BiasModeSelector'

// Note: Using fallback wheel for Expo Go compatibility
// For full animated wheel, use development build (npx expo run:ios)

type WheelState = 'ready' | 'spinning' | 'result'

export default function WheelScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>()
  const router = useRouter()
  const { supabase } = useSupabase()

  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<WheelActivity[]>([])
  const [includedActivities, setIncludedActivities] = useState<WheelActivity[]>([])
  const [biasMode, setBiasMode] = useState<BiasMode>('none')
  const [wheelState, setWheelState] = useState<WheelState>('ready')
  const [winner, setWinner] = useState<WheelActivity | null>(null)
  const [error, setError] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      loadActivities()
    }, [groupId])
  )

  const loadActivities = async () => {
    if (!groupId) {
      setError('Invalid group ID')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: activitiesError } = await getGroupActivities(supabase, groupId)

      if (activitiesError || !data) {
        throw activitiesError || new Error('Failed to load activities')
      }

      setActivities(data)

      // Filter only activities included in wheel
      const included = data.filter((activity: any) => activity.include_in_wheel)
      setIncludedActivities(included)
    } catch (err: any) {
      console.error('Load activities error:', err)
      setError(err.message || 'Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  const handleSpin = () => {
    if (includedActivities.length === 0) {
      Alert.alert('No Activities', 'Add some activities to the wheel first!')
      return
    }

    // Check if bias mode is available
    const biasCheck = isBiasModeAvailable(includedActivities, biasMode)
    if (!biasCheck.available && biasCheck.reason) {
      Alert.alert('Bias Not Available', biasCheck.reason, [
        {
          text: 'Use Random Instead',
          onPress: () => performSpin('none'),
        },
        { text: 'Cancel', style: 'cancel' },
      ])
      return
    }

    performSpin(biasMode)
  }

  const performSpin = (mode: BiasMode) => {
    setWheelState('spinning')
    
    // Perform the spin
    const selectedWinner = spinWheel(includedActivities, mode)
    
    if (selectedWinner) {
      setWinner(selectedWinner)
      // State will be updated to 'result' after animation completes
    } else {
      setWheelState('ready')
      Alert.alert('Error', 'Failed to select a winner')
    }
  }

  const handleSpinComplete = () => {
    setWheelState('result')
  }

  const handleSpinAgain = () => {
    setWinner(null)
    setWheelState('ready')
  }

  const handleClose = () => {
    router.back()
  }

  // Check bias mode availability
  const ratingBiasCheck = isBiasModeAvailable(includedActivities, 'rating')
  const dateBiasCheck = isBiasModeAvailable(includedActivities, 'date')

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading activities...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadActivities}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Empty state: no activities at all
  if (activities.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Spin the Wheel</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>No Activities Yet</Text>
          <Text style={styles.emptyMessage}>
            Add some activities to your group first!
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push(`/activity/add?groupId=${groupId}`)}
          >
            <Text style={styles.primaryButtonText}>Add Activity</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Empty state: no activities included in wheel
  if (includedActivities.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Spin the Wheel</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>No Activities in Wheel</Text>
          <Text style={styles.emptyMessage}>
            Enable "Include in wheel" for some activities
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleClose}
          >
            <Text style={styles.primaryButtonText}>View Activities</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spin the Wheel</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {wheelState === 'ready' && (
          <>
            <View style={styles.infoSection}>
              <Text style={styles.activityCount}>
                {includedActivities.length} {includedActivities.length === 1 ? 'activity' : 'activities'} in wheel
              </Text>
            </View>

            <View style={styles.biasSelectorSection}>
              <BiasModeSelector
                selectedMode={biasMode}
                onSelectMode={setBiasMode}
                ratingAvailable={ratingBiasCheck.available}
                dateAvailable={dateBiasCheck.available}
              />
              {!ratingBiasCheck.available && biasMode === 'rating' && (
                <Text style={styles.biasWarning}>{ratingBiasCheck.reason}</Text>
              )}
              {!dateBiasCheck.available && biasMode === 'date' && (
                <Text style={styles.biasWarning}>{dateBiasCheck.reason}</Text>
              )}
            </View>

            <View style={styles.spinButtonContainer}>
              <TouchableOpacity
                style={styles.spinButton}
                onPress={handleSpin}
                activeOpacity={0.8}
              >
                <Text style={styles.spinButtonIcon}>🎯</Text>
                <Text style={styles.spinButtonText}>SPIN</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.activitiesPreview}>
              <Text style={styles.previewTitle}>Activities:</Text>
              {includedActivities.slice(0, 5).map((activity) => (
                <View key={activity.id} style={styles.previewItem}>
                  <Text style={styles.previewItemText} numberOfLines={1}>
                    • {activity.title}
                  </Text>
                </View>
              ))}
              {includedActivities.length > 5 && (
                <Text style={styles.previewMore}>
                  and {includedActivities.length - 5} more...
                </Text>
              )}
            </View>
          </>
        )}

        {wheelState === 'spinning' && (
          <View style={styles.spinnerSection}>
            <WheelSpinner
              activities={includedActivities}
              isSpinning={true}
              winner={winner}
              onSpinComplete={handleSpinComplete}
            />
          </View>
        )}

        {wheelState === 'result' && winner && (
          <View style={styles.resultSection}>
            <WheelResultCard winner={winner} onSpinAgain={handleSpinAgain} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  activityCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  biasSelectorSection: {
    marginBottom: 32,
  },
  biasWarning: {
    fontSize: 13,
    color: '#F59E0B',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  spinButtonContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  spinButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 100,
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  spinButtonIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  spinButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  activitiesPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  previewItem: {
    paddingVertical: 6,
  },
  previewItemText: {
    fontSize: 15,
    color: '#374151',
  },
  previewMore: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 8,
  },
  spinnerSection: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultSection: {
    minHeight: 400,
    justifyContent: 'center',
    paddingTop: 40,
  },
})
