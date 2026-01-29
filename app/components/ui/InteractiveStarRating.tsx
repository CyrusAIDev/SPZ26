import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

interface InteractiveStarRatingProps {
  value: number
  onChange: (value: number) => void
  size?: number
}

/**
 * Interactive star rating component for user input
 * Allows users to select 1-5 stars
 */
export function InteractiveStarRating({ 
  value, 
  onChange, 
  size = 32 
}: InteractiveStarRatingProps) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <View style={styles.container}>
      {stars.map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onChange(star)}
          style={styles.starButton}
          activeOpacity={0.7}
        >
          <Text 
            style={[
              styles.star, 
              { fontSize: size },
              star <= value ? styles.filledStar : styles.emptyStar
            ]}
          >
            {star <= value ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontWeight: 'bold',
  },
  filledStar: {
    color: '#FFB800',
  },
  emptyStar: {
    color: '#D1D5DB',
  },
})
