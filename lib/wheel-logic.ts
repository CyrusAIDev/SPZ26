/**
 * Wheel Decider Logic
 * Handles random selection of activities with different bias modes
 */

export type BiasMode = 'none' | 'rating' | 'date'

export interface WheelActivity {
  id: string
  title: string
  average_rating: number | null
  ratings_count: number
  activity_schedules?: Array<{ start_at: string }> | null
  [key: string]: any // Allow other properties from activity object
}

/**
 * Main function to spin the wheel and select a winner
 */
export function spinWheel(
  activities: WheelActivity[],
  biasMode: BiasMode = 'none'
): WheelActivity | null {
  if (!activities || activities.length === 0) {
    return null
  }

  if (activities.length === 1) {
    return activities[0]
  }

  const weights = calculateWeights(activities, biasMode)
  return weightedRandomSelection(activities, weights)
}

/**
 * Calculate weights for each activity based on bias mode
 */
export function calculateWeights(
  activities: WheelActivity[],
  biasMode: BiasMode
): number[] {
  switch (biasMode) {
    case 'rating':
      return calculateRatingWeights(activities)
    case 'date':
      return calculateDateWeights(activities)
    case 'none':
    default:
      return activities.map(() => 1) // Equal weights
  }
}

/**
 * Calculate weights based on average ratings
 * Higher ratings get proportionally higher weights
 */
function calculateRatingWeights(activities: WheelActivity[]): number[] {
  const hasAnyRating = activities.some(a => a.average_rating !== null)
  
  if (!hasAnyRating) {
    // No ratings available, fall back to equal weights
    return activities.map(() => 1)
  }

  return activities.map(activity => {
    // Use average rating if available, otherwise use group average or 3.0 baseline
    if (activity.average_rating !== null && activity.average_rating > 0) {
      return activity.average_rating
    }
    
    // For activities without ratings, use group average
    const ratedActivities = activities.filter(a => a.average_rating !== null)
    if (ratedActivities.length > 0) {
      const groupAverage = ratedActivities.reduce((sum, a) => sum + (a.average_rating || 0), 0) / ratedActivities.length
      return groupAverage
    }
    
    return 3.0 // Default baseline rating
  })
}

/**
 * Calculate weights based on scheduled dates
 * Upcoming activities get higher weights with exponential decay
 */
function calculateDateWeights(activities: WheelActivity[]): number[] {
  const now = new Date()
  const hasAnySchedule = activities.some(
    a => a.activity_schedules && a.activity_schedules.length > 0
  )

  if (!hasAnySchedule) {
    // No schedules available, fall back to equal weights
    return activities.map(() => 1)
  }

  return activities.map(activity => {
    const schedule = activity.activity_schedules?.[0]
    
    if (!schedule) {
      // Unscheduled activities get baseline weight
      return 0.5
    }

    const scheduledDate = new Date(schedule.start_at)
    const daysAway = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)

    // Weight calculation with exponential decay
    if (daysAway < 0) {
      // Past events get low weight
      return 0.2
    } else if (daysAway <= 1) {
      // Today or tomorrow - highest weight
      return 5.0
    } else if (daysAway <= 7) {
      // Within a week - high weight
      return 3.0
    } else if (daysAway <= 30) {
      // Within a month - medium weight with decay
      return Math.exp(-daysAway / 10)
    } else {
      // Far future - low weight
      return 0.3
    }
  })
}

/**
 * Perform weighted random selection using cumulative distribution
 */
function weightedRandomSelection(
  activities: WheelActivity[],
  weights: number[]
): WheelActivity {
  // Calculate cumulative weights
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  const cumulativeWeights: number[] = []
  let cumSum = 0

  for (const weight of weights) {
    cumSum += weight
    cumulativeWeights.push(cumSum)
  }

  // Generate random number between 0 and total weight
  const random = Math.random() * totalWeight

  // Find the activity corresponding to this random value
  for (let i = 0; i < cumulativeWeights.length; i++) {
    if (random <= cumulativeWeights[i]) {
      return activities[i]
    }
  }

  // Fallback (should never reach here)
  return activities[activities.length - 1]
}

/**
 * Check if bias mode is applicable for the given activities
 */
export function isBiasModeAvailable(
  activities: WheelActivity[],
  biasMode: BiasMode
): { available: boolean; reason?: string } {
  if (biasMode === 'none') {
    return { available: true }
  }

  if (biasMode === 'rating') {
    const hasRatings = activities.some(a => a.average_rating !== null)
    return {
      available: hasRatings,
      reason: hasRatings ? undefined : 'No ratings yet. Will use random selection.',
    }
  }

  if (biasMode === 'date') {
    const hasSchedules = activities.some(
      a => a.activity_schedules && a.activity_schedules.length > 0
    )
    return {
      available: hasSchedules,
      reason: hasSchedules ? undefined : 'No scheduled activities. Will use random selection.',
    }
  }

  return { available: true }
}

/**
 * Get a shuffled list of activities for animation purposes
 * Returns a random ordering of the activities
 */
export function shuffleActivities(activities: WheelActivity[]): WheelActivity[] {
  const shuffled = [...activities]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Calculate the rotation angle needed to land on the winner
 * Includes extra full rotations for visual effect
 */
export function calculateWinnerRotation(
  winnerIndex: number,
  totalActivities: number,
  extraSpins: number = 5
): number {
  const segmentAngle = 360 / totalActivities
  
  // Calculate the angle for the winner segment (pointing up at 0 degrees)
  // We want the winner segment to end up at the top (under the pointer)
  const winnerAngle = winnerIndex * segmentAngle
  
  // Add extra full rotations (360 * extraSpins)
  // Add random offset within the segment (0 to segmentAngle)
  const randomOffset = Math.random() * segmentAngle * 0.8 // Stay within segment
  
  const totalRotation = (360 * extraSpins) + winnerAngle + randomOffset
  
  return totalRotation
}

/**
 * Get a random number of extra spins for variety
 */
export function getRandomExtraSpins(): number {
  return Math.floor(Math.random() * 3) + 4 // 4-6 full rotations
}

