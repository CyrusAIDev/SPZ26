import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface StarRatingProps {
  rating: number
  size?: number
  showNumber?: boolean
}

/**
 * Display-only star rating component
 * Shows filled/half/empty stars based on decimal rating
 */
export function StarRating({ rating, size = 16, showNumber = false }: StarRatingProps) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Text key={`full-${i}`} style={[styles.star, { fontSize: size }]}>
            ★
          </Text>
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <Text key="half" style={[styles.star, { fontSize: size }]}>
            ★
          </Text>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Text key={`empty-${i}`} style={[styles.emptyStar, { fontSize: size }]}>
            ☆
          </Text>
        ))}
      </View>
      
      {showNumber && (
        <Text style={styles.numberText}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    color: '#FFB800',
  },
  emptyStar: {
    color: '#D1D5DB',
  },
  numberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 2,
  },
})
