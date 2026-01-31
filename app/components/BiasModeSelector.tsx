import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { BiasMode } from '@/lib/wheel-logic'

interface BiasModeSelectorProps {
  selectedMode: BiasMode
  onSelectMode: (mode: BiasMode) => void
  disabled?: boolean
  ratingAvailable?: boolean
  dateAvailable?: boolean
}

/**
 * Segmented control for selecting wheel bias mode
 */
export function BiasModeSelector({
  selectedMode,
  onSelectMode,
  disabled = false,
  ratingAvailable = true,
  dateAvailable = true,
}: BiasModeSelectorProps) {
  const modes: Array<{ id: BiasMode; label: string; icon: string; available: boolean }> = [
    { id: 'none', label: 'Random', icon: '🎲', available: true },
    { id: 'rating', label: 'Rating', icon: '⭐', available: ratingAvailable },
    { id: 'date', label: 'Date', icon: '📅', available: dateAvailable },
  ]

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Bias Mode</Text>
      <View style={styles.segmentedControl}>
        {modes.map((mode) => {
          const isSelected = selectedMode === mode.id
          const isDisabled = disabled || !mode.available

          return (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.segment,
                isSelected && styles.segmentSelected,
                isDisabled && styles.segmentDisabled,
              ]}
              onPress={() => !isDisabled && onSelectMode(mode.id)}
              disabled={isDisabled}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.segmentIcon,
                  isDisabled && styles.segmentIconDisabled,
                ]}
              >
                {mode.icon}
              </Text>
              <Text
                style={[
                  styles.segmentLabel,
                  isSelected && styles.segmentLabelSelected,
                  isDisabled && styles.segmentLabelDisabled,
                ]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  segmentSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentDisabled: {
    opacity: 0.4,
  },
  segmentIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  segmentIconDisabled: {
    opacity: 0.5,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  segmentLabelSelected: {
    color: '#3B82F6',
  },
  segmentLabelDisabled: {
    color: '#9CA3AF',
  },
})
