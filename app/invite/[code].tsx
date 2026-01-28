import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSupabase } from '@/hooks/useSupabase'
import { getInviteByCode, signInAnonymously, redeemInvite } from '@/lib/supabase-helpers'

type InviteData = {
  id: string
  code: string
  group_id: string
  groups: {
    id: string
    name: string
    icon_url: string | null
  } | null
}

export default function InviteScreen() {
  const { code } = useLocalSearchParams<{ code: string }>()
  const router = useRouter()
  const { supabase, session } = useSupabase()

  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInvite()
  }, [code])

  const loadInvite = async () => {
    if (!code) {
      setError('Invalid invite link')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Ensure we have an anonymous session if not authenticated
      if (!session) {
        const { error: authError } = await signInAnonymously(supabase)
        if (authError) {
          throw new Error('Failed to initialize session')
        }
      }

      // Fetch invite details
      const { data, error: inviteError } = await getInviteByCode(supabase, code)

      if (inviteError || !data) {
        throw inviteError || new Error('Invite not found')
      }

      setInviteData(data as InviteData)
    } catch (err: any) {
      console.error('Load invite error:', err)
      setError(err.message || 'Failed to load invite')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async () => {
    if (!displayName.trim()) {
      Alert.alert('Display Name Required', 'Please enter your display name to join the group')
      return
    }

    if (!inviteData || !code) {
      return
    }

    try {
      setJoining(true)
      setError(null)

      // Redeem the invite
      const { data, error: redeemError } = await redeemInvite(
        supabase,
        code,
        displayName.trim()
      )

      if (redeemError || !data) {
        throw redeemError || new Error('Failed to join group')
      }

      // Navigate to group home
      router.replace(`/group/${data.group_id}`)
    } catch (err: any) {
      console.error('Join group error:', err)
      
      let errorMessage = 'Failed to join group'
      if (err.message?.includes('expired')) {
        errorMessage = 'This invite has expired'
      } else if (err.message?.includes('maximum uses')) {
        errorMessage = 'This invite has reached its maximum uses'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      Alert.alert('Error', errorMessage)
      setError(errorMessage)
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading invite...</Text>
      </View>
    )
  }

  if (error && !inviteData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Invalid Invite</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadInvite}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!inviteData || !inviteData.groups) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Group Not Found</Text>
        <Text style={styles.errorMessage}>This invite link is invalid or the group no longer exists</Text>
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.inviteEmoji}>🎉</Text>
            <Text style={styles.inviteTitle}>You've been invited!</Text>
          </View>

          {/* Group Info */}
          <View style={styles.groupCard}>
            {inviteData.groups.icon_url ? (
              <View style={styles.groupIconPlaceholder}>
                <Text style={styles.groupIconText}>
                  {inviteData.groups.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            ) : (
              <View style={styles.groupIconPlaceholder}>
                <Text style={styles.groupIconText}>
                  {inviteData.groups.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.groupName}>{inviteData.groups.name}</Text>
            <Text style={styles.groupSubtext}>
              Join to decide activities together
            </Text>
          </View>

          {/* Display Name Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>What should we call you?</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your display name"
              placeholderTextColor="#999"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleJoinGroup}
              editable={!joining}
            />
          </View>

          {/* Error Message */}
          {error && inviteData && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* Join Button */}
          <TouchableOpacity
            style={[styles.joinButton, joining && styles.joinButtonDisabled]}
            onPress={handleJoinGroup}
            disabled={joining || !displayName.trim()}
          >
            {joining ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.joinButtonText}>Join Group</Text>
            )}
          </TouchableOpacity>

          {/* Info Text */}
          <Text style={styles.infoText}>
            No account required. You can join instantly!
          </Text>
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
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  inviteEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  inviteTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  groupIconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupIconText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  groupSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  joinButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  errorBanner: {
    backgroundColor: '#FEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
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
})
