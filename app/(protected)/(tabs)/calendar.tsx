import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { Calendar, DateData } from 'react-native-calendars'
import { useSupabase } from '@/hooks/useSupabase'
import { getScheduledActivitiesForMonth, getActivitiesForDate } from '@/lib/supabase-helpers'
import { CalendarActivityCard } from '@/app/components/CalendarActivityCard'

export default function CalendarScreen() {
  const { supabase } = useSupabase()
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  const [currentMonth, setCurrentMonth] = useState(getTodayMonth())
  const [markedDates, setMarkedDates] = useState<any>({})
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [groupFilter, setGroupFilter] = useState<string | null>(null)

  // Load month data when month changes
  useEffect(() => {
    loadMonthData()
  }, [currentMonth, groupFilter])

  // Load activities for selected date
  useEffect(() => {
    loadActivitiesForDate()
  }, [selectedDate, groupFilter])

  const loadMonthData = async () => {
    try {
      setLoading(true)
      const [year, month] = currentMonth.split('-').map(Number)
      
      const { data, error } = await getScheduledActivitiesForMonth(
        supabase,
        year,
        month,
        groupFilter || undefined
      )

      if (error) throw error

      // Create marked dates object
      const marks: any = {}
      
      if (data && data.length > 0) {
        data.forEach((schedule: any) => {
          const dateKey = schedule.start_at.split('T')[0]
          if (!marks[dateKey]) {
            marks[dateKey] = {
              marked: true,
              dotColor: '#10B981',
            }
          }
        })
      }

      // Add selected date highlighting
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: '#3B82F6',
      }

      setMarkedDates(marks)
    } catch (error) {
      console.error('Load month data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadActivitiesForDate = async () => {
    try {
      setLoadingActivities(true)
      
      const { data, error } = await getActivitiesForDate(
        supabase,
        selectedDate,
        groupFilter || undefined
      )

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error('Load activities for date error:', error)
      setActivities([])
    } finally {
      setLoadingActivities(false)
    }
  }

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString)
    
    // Update marked dates with new selection
    const newMarks = { ...markedDates }
    
    // Remove previous selection
    Object.keys(newMarks).forEach(key => {
      if (newMarks[key].selected) {
        const { selected, selectedColor, ...rest } = newMarks[key]
        newMarks[key] = rest.marked ? rest : undefined
      }
    })
    
    // Add new selection
    newMarks[day.dateString] = {
      ...newMarks[day.dateString],
      selected: true,
      selectedColor: '#3B82F6',
    }
    
    setMarkedDates(newMarks)
  }

  const handleMonthChange = (month: DateData) => {
    const monthString = `${month.year}-${String(month.month).padStart(2, '0')}`
    setCurrentMonth(monthString)
  }

  const handleTodayPress = () => {
    const today = getTodayString()
    setSelectedDate(today)
    setCurrentMonth(getTodayMonth())
  }

  return (
    <View style={styles.container}>
      {/* Calendar */}
      <Calendar
        current={currentMonth + '-01'}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        markedDates={markedDates}
        markingType="dot"
        theme={{
          todayTextColor: '#EF4444',
          selectedDayBackgroundColor: '#3B82F6',
          selectedDayTextColor: '#FFFFFF',
          dotColor: '#10B981',
          selectedDotColor: '#FFFFFF',
          arrowColor: '#3B82F6',
          monthTextColor: '#111827',
          textMonthFontWeight: '600',
          textMonthFontSize: 18,
          textDayFontSize: 15,
          textDayHeaderFontSize: 13,
        }}
      />

      {/* Today Button */}
      <View style={styles.todayButtonContainer}>
        <TouchableOpacity style={styles.todayButton} onPress={handleTodayPress}>
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>

      {/* Activities List */}
      <View style={styles.activitiesContainer}>
        <Text style={styles.activitiesTitle}>
          {formatSelectedDate(selectedDate)}
        </Text>

        <ScrollView
          style={styles.activitiesList}
          contentContainerStyle={styles.activitiesListContent}
          showsVerticalScrollIndicator={false}
        >
          {loadingActivities ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : activities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>No activities scheduled</Text>
              <Text style={styles.emptyText}>
                {selectedDate === getTodayString()
                  ? 'Nothing scheduled for today'
                  : 'Nothing scheduled for this date'}
              </Text>
            </View>
          ) : (
            activities.map((schedule) => (
              <CalendarActivityCard
                key={schedule.id}
                schedule={schedule}
                showGroup={!groupFilter}
              />
            ))
          )}
        </ScrollView>
      </View>
    </View>
  )
}

function getTodayString(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

function getTodayMonth(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

function formatSelectedDate(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const selected = new Date(date)
  selected.setHours(0, 0, 0, 0)

  const diffTime = selected.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Tomorrow'
  } else if (diffDays === -1) {
    return 'Yesterday'
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  todayButtonContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 12,
    alignItems: 'center',
  },
  todayButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  todayButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  activitiesContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  activitiesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  activitiesList: {
    flex: 1,
  },
  activitiesListContent: {
    padding: 20,
    paddingTop: 0,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
})
