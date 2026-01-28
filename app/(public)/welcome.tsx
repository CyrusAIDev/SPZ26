import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from "react-native";

import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Welcome to Group Activity Decider</Text>
          <Text style={styles.subtitle}>
            Decide what to do with friends—without endless texting
          </Text>
        </View>

        {/* How It Works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How it works:</Text>
          
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>1</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Get invited to a group</Text>
              <Text style={styles.stepDescription}>
                Friend sends you a link or QR code
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Join instantly</Text>
              <Text style={styles.stepDescription}>
                Just enter your name—no account needed
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>3</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Decide together</Text>
              <Text style={styles.stepDescription}>
                Add activities, vote, spin the wheel, and pick what to do
              </Text>
            </View>
          </View>
        </View>

        {/* Optional Upgrade Info */}
        <View style={styles.upgradeSection}>
          <Text style={styles.upgradeTitle}>Want more features?</Text>
          <Text style={styles.upgradeDescription}>
            Upgrade your account to sync across devices, connect your calendar, and get reminders
          </Text>
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Account</Text>
          </TouchableOpacity>
        </View>

        {/* Test Setup Button - Development Only */}
        <View style={styles.testSection}>
          <Text style={styles.testLabel}>Development Testing</Text>
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => router.push("/test-setup")}
          >
            <Text style={styles.testButtonText}>🧪 Test Setup</Text>
          </TouchableOpacity>
        </View>

        {/* Info Text */}
        <Text style={styles.infoText}>
          Waiting for an invite? Ask a friend to add you to their group!
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  howItWorksSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 32,
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  upgradeSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  upgradeDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  upgradeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  testSection: {
    marginTop: 8,
    padding: 16,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  testLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "600",
  },
  testButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  testButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  infoText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 24,
    fontStyle: "italic",
  },
});
