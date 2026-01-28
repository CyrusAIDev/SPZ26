import { useState } from 'react'
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
import { useSupabase } from '@/hooks/useSupabase'
import { createActivity } from '@/lib/supabase-helpers'

export default function AddActivityScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>()
  const router = useRouter()
  const { supabase } = useSupabase()

  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [includeInWheel, setIncludeInWheel] = useState(true)
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
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

    if (!groupId) {
      Alert.alert('Error', 'Invalid group ID')
      return
    }

    try {
      setCreating(true)

      const { data, error } = await createActivity(
        supabase,
        groupId,
        title,
        notes || undefined,
        includeInWheel
      )

      if (error) {
        throw error
      }

      // Success - navigate back to group home
      router.back()
      
    } catch (error: any) {
      console.error('Create activity error:', error)
      Alert.alert('Error', error.message || 'Failed to create activity')
    } finally {
      setCreating(false)
    }
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
              editable={!creating}
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
              editable={!creating}
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
              disabled={creating}
            />
          </View>

          {/* Schedule Section - Coming Soon */}
          <View style={styles.comingSoonSection}>
            <Text style={styles.comingSoonIcon}>📅</Text>
            <Text style={styles.comingSoonTitle}>Schedule (Coming Soon)</Text>
            <Text style={styles.comingSoonText}>
              You'll be able to add dates and times in the next update
            </Text>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, creating && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={creating || !title.trim()}
          >
            {creating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Activity</Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={creating}
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
  comingSoonSection: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  comingSoonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  comingSoonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  comingSoonText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  createButton: {
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
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
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
