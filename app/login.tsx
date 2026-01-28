import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSupabase } from '@/hooks/useSupabase'

export default function LoginScreen() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)

  const handleAppleSignIn = async () => {
    try {
      setLoading(true)
      Alert.alert(
        'Apple Sign In',
        'Apple OAuth is not yet configured. Please set up Apple authentication in your Supabase dashboard.',
        [{ text: 'OK' }]
      )
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign in with Apple')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      Alert.alert(
        'Google Sign In',
        'Google OAuth is not yet configured. Please set up Google authentication in your Supabase dashboard.',
        [{ text: 'OK' }]
      )
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    router.back()
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.lockEmoji}>🔐</Text>
          <Text style={styles.title}>Upgrade Your Account</Text>
          <Text style={styles.subtitle}>
            Sign in to sync your data across devices, connect your calendar, and unlock all features
          </Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>☁️</Text>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Sync Across Devices</Text>
              <Text style={styles.benefitDescription}>
                Access your groups from any device
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>📅</Text>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Calendar Integration</Text>
              <Text style={styles.benefitDescription}>
                Add activities to your calendar
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🔔</Text>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Reminders</Text>
              <Text style={styles.benefitDescription}>
                Get notified about upcoming activities
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🎫</Text>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Event Discovery</Text>
              <Text style={styles.benefitDescription}>
                Browse and add local events
              </Text>
            </View>
          </View>
        </View>

        {/* Sign In Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.signInButton, styles.appleButton]}
            onPress={handleAppleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.appleIcon}></Text>
                <Text style={styles.signInButtonText}>Continue with Apple</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signInButton, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#1A1A1A" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={[styles.signInButtonText, styles.googleButtonText]}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Skip Option */}
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>Maybe Later</Text>
        </TouchableOpacity>

        {/* Info Text */}
        <Text style={styles.infoText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  lockEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  benefitsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  benefitIcon: {
    fontSize: 32,
    marginRight: 16,
    width: 40,
    textAlign: 'center',
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
  },
  buttonSection: {
    marginBottom: 20,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appleButton: {
    backgroundColor: '#000',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  appleIcon: {
    fontSize: 20,
    color: '#fff',
    marginRight: 8,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: 8,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  googleButtonText: {
    color: '#1A1A1A',
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
})
