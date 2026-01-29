import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native'
import { InteractiveStarRating } from './ui/InteractiveStarRating'
import { useSupabase } from '@/hooks/useSupabase'
import { createOrUpdateRating } from '@/lib/supabase-helpers'
import { ActivityRating } from '@/types/database.types'

interface RateActivityModalProps {
  visible: boolean
  onClose: () => void
  activityId: string
  activityTitle: string
  groupId: string
  existingRating?: ActivityRating | null
  onSuccess?: () => void
}

/**
 * Modal for rating an activity
 * Handles both creating new ratings and updating existing ones
 */
export function RateActivityModal({
  visible,
  onClose,
  activityId,
  activityTitle,
  groupId,
  existingRating,
  onSuccess,
}: RateActivityModalProps) {
  const { supabase } = useSupabase()
  const [stars, setStars] = useState(existingRating?.stars || 0)
  const [note, setNote] = useState(existingRating?.note || '')
  const [saving, setSaving] = useState(false)

  // Reset form when existingRating changes
  useEffect(() => {
    setStars(existingRating?.stars || 0)
    setNote(existingRating?.note || '')
  }, [existingRating])

  const handleSave = async () => {
    if (stars === 0) {
      Alert.alert('Rating Required', 'Please select a star rating')
      return
    }

    if (note.length > 500) {
      Alert.alert('Note Too Long', 'Note must be 500 characters or less')
      return
    }

    setSaving(true)

    try {
      const { error } = await createOrUpdateRating(
        supabase,
        activityId,
        groupId,
        stars,
        note
      )

      if (error) {
        throw error
      }

      Alert.alert(
        'Success',
        existingRating ? 'Rating updated!' : 'Rating saved!',
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess?.()
              onClose()
            },
          },
        ]
      )
    } catch (error) {
      console.error('Save rating error:', error)
      Alert.alert('Error', 'Failed to save rating. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (!saving) {
      onClose()
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} disabled={saving}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              {existingRating ? 'Update Rating' : 'Rate Activity'}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.activityTitle} numberOfLines={2}>
              {activityTitle}
            </Text>

            <View style={styles.section}>
              <Text style={styles.label}>Your Rating</Text>
              <InteractiveStarRating value={stars} onChange={setStars} size={40} />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>
                Note (Optional) {note.length > 0 && `${note.length}/500`}
              </Text>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Share your thoughts about this activity..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, (saving || stars === 0) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving || stars === 0}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Rating'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    fontSize: 16,
    color: '#3B82F6',
    width: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 32,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  noteInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    minHeight: 120,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})
