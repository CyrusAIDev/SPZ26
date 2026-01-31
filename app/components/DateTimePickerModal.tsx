import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

interface DateTimePickerModalProps {
  visible: boolean
  value: Date
  mode: 'date' | 'time' | 'datetime'
  onConfirm: (date: Date) => void
  onCancel: () => void
  minimumDate?: Date
  maximumDate?: Date
}

/**
 * Cross-platform date/time picker modal
 * Uses native pickers for iOS and Android
 */
export function DateTimePickerModal({
  visible,
  value,
  mode,
  onConfirm,
  onCancel,
  minimumDate,
  maximumDate,
}: DateTimePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState(value)
  const [showPicker, setShowPicker] = useState(false)

  // Sync with prop changes - fixes date picker not updating
  useEffect(() => {
    setShowPicker(visible)
    if (visible) {
      setSelectedDate(value) // Reset to initial value when opening
    }
  }, [visible, value])

  const handleConfirm = () => {
    onConfirm(selectedDate)
    setShowPicker(false)
  }

  const handleCancel = () => {
    onCancel()
    setShowPicker(false)
  }

  const onChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false)
      if (event.type === 'set' && date) {
        onConfirm(date)
      } else {
        onCancel()
      }
    } else {
      if (date) {
        setSelectedDate(date)
      }
    }
  }

  if (Platform.OS === 'android') {
    return showPicker && visible ? (
      <DateTimePicker
        value={selectedDate}
        mode={mode}
        display="default"
        onChange={onChange}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
    ) : null
  }

  // iOS implementation
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <SafeAreaView style={styles.container}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleCancel}
        />
        <View style={styles.pickerContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              {mode === 'date' ? 'Select Date' : mode === 'time' ? 'Select Time' : 'Select Date & Time'}
            </Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={styles.confirmButton}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={selectedDate}
            mode={mode}
            display="spinner"
            onChange={onChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            style={styles.picker}
          />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  cancelButton: {
    fontSize: 17,
    color: '#6B7280',
  },
  confirmButton: {
    fontSize: 17,
    fontWeight: '600',
    color: '#3B82F6',
  },
  picker: {
    height: 200,
  },
})
