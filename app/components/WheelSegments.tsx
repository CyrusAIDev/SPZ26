import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg'
import { WheelActivity } from '@/lib/wheel-logic'

interface WheelSegmentsProps {
  activities: WheelActivity[]
  rotation: number
  size?: number
}

// Color palette for wheel segments
const segmentColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B739', '#52B788', '#E76F51', '#A8DADC',
]

/**
 * SVG-based wheel with colored segments
 * Each segment represents one activity
 */
export function WheelSegments({ activities, rotation, size = 300 }: WheelSegmentsProps) {
  const radius = size / 2
  const centerX = radius
  const centerY = radius
  const segmentAngle = 360 / activities.length

  // Calculate path for a segment
  const getSegmentPath = (index: number): string => {
    const startAngle = index * segmentAngle - 90 // Start from top
    const endAngle = (index + 1) * segmentAngle - 90

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const outerRadius = radius * 0.9
    const innerRadius = radius * 0.2

    const x1 = centerX + outerRadius * Math.cos(startRad)
    const y1 = centerY + outerRadius * Math.sin(startRad)
    const x2 = centerX + outerRadius * Math.cos(endRad)
    const y2 = centerY + outerRadius * Math.sin(endRad)
    const x3 = centerX + innerRadius * Math.cos(endRad)
    const y3 = centerY + innerRadius * Math.sin(endRad)
    const x4 = centerX + innerRadius * Math.cos(startRad)
    const y4 = centerY + innerRadius * Math.sin(startRad)

    const largeArcFlag = segmentAngle > 180 ? 1 : 0

    return `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
      Z
    `
  }

  // Get text position and rotation for segment label
  const getTextTransform = (index: number) => {
    const angle = index * segmentAngle + segmentAngle / 2 - 90
    const textRadius = radius * 0.65
    const rad = (angle * Math.PI) / 180
    const x = centerX + textRadius * Math.cos(rad)
    const y = centerY + textRadius * Math.sin(rad)
    const rotation = angle + 90

    return { x, y, rotation }
  }

  // Truncate long activity names
  const truncateText = (text: string, maxLength = 12) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 1) + '…'
  }

  return (
    <View style={styles.container}>
      {/* Pointer at top */}
      <View style={styles.pointerContainer}>
        <View style={styles.pointer} />
      </View>

      <Svg width={size} height={size} style={styles.svg}>
        <G rotation={rotation} origin={`${centerX}, ${centerY}`}>
          {activities.map((activity, index) => {
            const color = segmentColors[index % segmentColors.length]
            const textTransform = getTextTransform(index)
            const truncatedTitle = truncateText(activity.title)

            return (
              <G key={activity.id}>
                {/* Segment path */}
                <Path d={getSegmentPath(index)} fill={color} stroke="#FFFFFF" strokeWidth={3} />

                {/* Activity text */}
                <SvgText
                  x={textTransform.x}
                  y={textTransform.y}
                  fill="#FFFFFF"
                  fontSize={activities.length > 10 ? 11 : 14}
                  fontWeight="bold"
                  textAnchor="middle"
                  rotation={textTransform.rotation}
                  origin={`${textTransform.x}, ${textTransform.y}`}
                >
                  {truncatedTitle}
                </SvgText>
              </G>
            )
          })}

          {/* Center circle */}
          <Circle cx={centerX} cy={centerY} r={radius * 0.15} fill="#3B82F6" />
          <SvgText
            x={centerX}
            y={centerY + 5}
            fill="#FFFFFF"
            fontSize={16}
            fontWeight="bold"
            textAnchor="middle"
          >
            SPIN
          </SvgText>
        </G>
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    backgroundColor: 'transparent',
  },
  pointerContainer: {
    position: 'absolute',
    top: 0,
    zIndex: 10,
    alignItems: 'center',
  },
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#EF4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
})
