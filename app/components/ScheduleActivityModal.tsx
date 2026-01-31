import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { DateTimePickerModal } from './DateTimePickerModal'

interface ScheduleActivityModalProps {
  visible: boolean
  onClose: () => void
  onScheduleSet: (date: Date) => void
  initialDate?: Date
}

/**
 * Modal for selecting a date/time for an activity
 * Used during activity creation or editing
 */
export function ScheduleActivityModal({
  visible,
  onClose,
  onScheduleSet,
  initialDate,
}: ScheduleActivityModalProps) {
  const [startDate, setStartDate] = useState(initialDate || new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  // Reset state when modal opens or initialDate changes
  useEffect(() => {
    if (visible) {
      setStartDate(initialDate || new Date())
    }
  }, [visible, initialDate])

  const handleSave = () => {
    onScheduleSet(startDate)
    onClose()
  }

  const handleDateConfirm = (date: Date) => {
    // Preserve the time component
    const newDate = new Date(startDate)
    newDate.setFullYear(date.getFullYear())
    newDate.setMonth(date.getMonth())
    newDate.setDate(date.getDate())
    setStartDate(newDate)
    setShowDatePicker(false)
  }

  const handleTimeConfirm = (date: Date) => {
    // Preserve the date component
    const newDate = new Date(startDate)
    newDate.setHours(date.getHours())
    newDate.setMinutes(date.getMinutes())
    setStartDate(newDate)
    setShowTimePicker(false)
  }

  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Schedule Activity</Text>
              <View style={{ width: 60 }} />
            </View>

            <View style={styles.content}>
              <Text style={styles.sectionTitle}>When?</Text>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.dateTimeContent}>
                  <Text style={styles.dateTimeIcon}>📅</Text>
                  <View style={styles.dateTimeTextContainer}>
                    <Text style={styles.dateTimeLabel}>Date</Text>
                    <Text style={styles.dateTimeValue}>{formattedDate}</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <View style={styles.dateTimeContent}>
                  <Text style={styles.dateTimeIcon}>🕐</Text>
                  <View style={styles.dateTimeTextContainer}>
                    <Text style={styles.dateTimeLabel}>Time</Text>
                    <Text style={styles.dateTimeValue}>{formattedTime}</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <View style={styles.timezoneNote}>
                <Text style={styles.timezoneText}>
                  Using device timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Set Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <DateTimePickerModal
        visible={showDatePicker}
        value={startDate}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
      />

      <DateTimePickerModal
        visible={showTimePicker}
        value={startDate}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={() => setShowTimePicker(false)}
      />
    </>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateTimeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateTimeIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  dateTimeTextContainer: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  chevron: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  timezoneNote: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  timezoneText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
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
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})
