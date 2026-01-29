import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { useSupabase } from '@/hooks/useSupabase'
import { getActivity, updateActivity } from '@/lib/supabase-helpers'

export default function EditActivityScreen() {
  const { activityId } = useLocalSearchParams<{ activityId: string }>()
  const router = useRouter()
  const { supabase, session } = useSupabase()

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [includeInWheel, setIncludeInWheel] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      const { data, error: activityError } = await getActivity(supabase, activityId)

      if (activityError || !data) {
        throw activityError || new Error('Activity not found')
      }

      // Handle activities with undefined created_by (old data)
      // RLS will handle actual permission enforcement on save
      if (!data.created_by) {
        console.warn('Activity has no creator, will attempt to claim on save')
      }

      // Pre-fill form with existing data
      setTitle(data.title)
      setNotes(data.notes || '')
      setIncludeInWheel(data.include_in_wheel)
    } catch (err: any) {
      console.error('Load activity error:', err)
      setError(err.message || 'Failed to load activity')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter an activity title')
      return
    }

    if (title.trim().length > 100) {
      Alert.alert('Title Too Long', 'Title must be 100 characters or less')
      return
    }

    if (notes.trim().length > 500) {
      Alert.alert('Notes Too Long', 'Notes must be 500 characters or less')
      return
    }

    if (!activityId) {
      Alert.alert('Error', 'Invalid activity ID')
      return
    }

    try {
      setSaving(true)

      const { data, error } = await updateActivity(supabase, activityId, {
        title: title.trim(),
        notes: notes.trim() || undefined,
        include_in_wheel: includeInWheel,
      })

      if (error) {
        // Check if it's a permission error from RLS
        if (error.message?.includes('permission') || error.code === '42501') {
          throw new Error('You do not have permission to edit this activity')
        }
        throw error
      }

      // Success - navigate back
      router.back()
    } catch (error: any) {
      console.error('Update activity error:', error)
      Alert.alert('Error', error.message || 'Failed to update activity')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading activity...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <TouchableOpacity 
          style={styles.backButtonError}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonTextError}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Cannot Edit Activity</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Title Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="What's the activity?"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
              autoCapitalize="words"
              maxLength={100}
              editable={!saving}
            />
            <Text style={styles.inputHint}>{title.length}/100 characters</Text>
          </View>

          {/* Notes Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add details, location, etc."
              placeholderTextColor="#999"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
              editable={!saving}
            />
            <Text style={styles.inputHint}>{notes.length}/500 characters</Text>
          </View>

          {/* Include in Wheel Toggle */}
          <View style={styles.toggleSection}>
            <View style={styles.toggleContent}>
              <Text style={styles.toggleLabel}>Include in wheel</Text>
              <Text style={styles.toggleDescription}>
                When enabled, this activity can be selected by the wheel decider
              </Text>
            </View>
            <Switch
              value={includeInWheel}
              onValueChange={setIncludeInWheel}
              disabled={saving}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving || !title.trim()}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  backButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonError: {
    position: 'absolute',
    top: 20,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    zIndex: 1,
  },
  backButtonTextError: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  toggleContent: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
})
