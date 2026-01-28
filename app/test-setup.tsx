import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Clipboard,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSupabase } from '@/hooks/useSupabase'
import { createGroup, signInAnonymously } from '@/lib/supabase-helpers'

type GroupData = {
  group_id: string
  group_name: string
  invite_code?: string
}

export default function TestSetupScreen() {
  const router = useRouter()
  const { supabase, session } = useSupabase()

  const [loading, setLoading] = useState(false)
  const [groupData, setGroupData] = useState<GroupData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreateTestGroup = async () => {
    try {
      setLoading(true)
      setError(null)

      // Ensure we have a session (anonymous or otherwise)
      if (!session) {
        const { error: authError } = await signInAnonymously(supabase)
        if (authError) {
          throw new Error('Failed to create anonymous session')
        }
      }

      // Create the group
      const { data, error: createError } = await createGroup(
        supabase,
        'Test Group',
        'Test User'
      )

      if (createError || !data) {
        throw createError || new Error('Failed to create group')
      }

      // Fetch the invite code for this group
      const { data: invites, error: inviteError } = await supabase
        .from('invites')
        .select('code')
        .eq('group_id', data.group_id)
        .limit(1)
        .single()

      if (inviteError || !invites) {
        console.warn('Could not fetch invite code:', inviteError)
      }

      setGroupData({
        group_id: data.group_id,
        group_name: data.group_name,
        invite_code: invites?.code,
      })

      Alert.alert('Success!', 'Test group created successfully')
    } catch (err: any) {
      console.error('Create test group error:', err)
      setError(err.message || 'Failed to create test group')
      Alert.alert('Error', err.message || 'Failed to create test group')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (!groupData?.invite_code) return

    const inviteLink = `groupactivity://invite/${groupData.invite_code}`
    Clipboard.setString(inviteLink)
    Alert.alert('Copied!', 'Invite link copied to clipboard')
  }

  const handleTestInvite = () => {
    if (!groupData?.invite_code) return
    router.push(`/invite/${groupData.invite_code}`)
  }

  const handleReset = () => {
    setGroupData(null)
    setError(null)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🧪 Test Setup</Text>
          <Text style={styles.subtitle}>
            Create a test group to test the invite flow
          </Text>
        </View>

        {/* Instructions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How to Test:</Text>
          <Text style={styles.instruction}>1. Create a test group</Text>
          <Text style={styles.instruction}>2. Copy the invite link</Text>
          <Text style={styles.instruction}>
            3. Send it via iMessage to yourself
          </Text>
          <Text style={styles.instruction}>4. Tap the link to test</Text>
          <Text style={styles.instruction}>5. Complete the join flow</Text>
        </View>

        {/* Create Group Button */}
        {!groupData && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleCreateTestGroup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Test Group</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Group Data Display */}
        {groupData && (
          <View style={styles.resultCard}>
            <Text style={styles.successEmoji}>✅</Text>
            <Text style={styles.successTitle}>Group Created!</Text>

            <View style={styles.dataSection}>
              <Text style={styles.dataLabel}>Group Name:</Text>
              <Text style={styles.dataValue}>{groupData.group_name}</Text>
            </View>

            <View style={styles.dataSection}>
              <Text style={styles.dataLabel}>Group ID:</Text>
              <Text style={styles.dataValue}>{groupData.group_id}</Text>
            </View>

            {groupData.invite_code && (
              <>
                <View style={styles.dataSection}>
                  <Text style={styles.dataLabel}>Invite Code:</Text>
                  <Text style={styles.dataValue}>{groupData.invite_code}</Text>
                </View>

                <View style={styles.dataSection}>
                  <Text style={styles.dataLabel}>Invite Link:</Text>
                  <Text style={[styles.dataValue, styles.linkValue]}>
                    groupactivity://invite/{groupData.invite_code}
                  </Text>
                </View>

                {/* QR Code Placeholder */}
                <View style={styles.qrCodePlaceholder}>
                  <Text style={styles.qrCodeEmoji}>📱</Text>
                  <Text style={styles.qrCodeText}>
                    QR Code would go here
                  </Text>
                  <Text style={styles.qrCodeSubtext}>
                    (Install expo-qrcode to display)
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={handleCopyLink}
                  >
                    <Text style={styles.secondaryButtonText}>📋 Copy Link</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={handleTestInvite}
                  >
                    <Text style={styles.secondaryButtonText}>🧪 Test Now</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Create Another Group</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Session Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Session Status:</Text>
          <Text style={styles.infoValue}>
            {session ? `✅ Authenticated (${session.user.id.slice(0, 8)}...)` : '❌ Not authenticated'}
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
    lineHeight: 22,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
    flex: 1,
    marginHorizontal: 4,
  },
  resetButton: {
    backgroundColor: '#F0F0F0',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 24,
  },
  dataSection: {
    width: '100%',
    marginBottom: 16,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 15,
    color: '#1A1A1A',
    fontFamily: 'monospace',
  },
  linkValue: {
    color: '#007AFF',
  },
  qrCodePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  qrCodeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  qrCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  qrCodeSubtext: {
    fontSize: 12,
    color: '#BBB',
  },
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 8,
  },
  errorCard: {
    backgroundColor: '#FEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  bottomSpacing: {
    height: 40,
  },
})
