/**
 * FlavorBubble Component
 *
 * Individual flavor bubble for the flavor wheel.
 * Rendered using SVG for optimal performance.
 */

import React, { memo } from 'react';
import { Circle, G, Text } from 'react-native-svg';
import type { Flavor } from '../../types/flavor.types';

export interface FlavorBubbleProps {
  flavor: Flavor;
  x: number;
  y: number;
  radius: number;
  isSelected: boolean;
  intensity?: number; // 1-5 for selected flavors
  onPress: (flavor: Flavor) => void;
}

export const FlavorBubble: React.FC<FlavorBubbleProps> = memo(({
  flavor,
  x,
  y,
  radius,
  isSelected,
  intensity = 3,
  onPress,
}) => {
  const strokeWidth = 2;
  const fillOpacity = isSelected ? 0.3 + (intensity * 0.14) : 0.15; // 0.3-0.85 based on intensity
  const strokeOpacity = isSelected ? 1 : 0.6;

  return (
    <G>
      {/* Main bubble circle */}
      <Circle
        cx={x}
        cy={y}
        r={radius}
        fill={flavor.color}
        fillOpacity={fillOpacity}
        stroke={flavor.color}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        onPress={() => onPress(flavor)}
      />

      {/* Selection ring for selected flavors */}
      {isSelected && (
        <Circle
          cx={x}
          cy={y}
          r={radius + 4}
          fill="none"
          stroke={flavor.color}
          strokeWidth={3}
          strokeOpacity={0.8}
        />
      )}

      {/* Flavor name label - only show for larger bubbles */}
      {radius > 20 && (
        <Text
          x={x}
          y={y}
          fontSize={10}
          fill="#000"
          fillOpacity={0.7}
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {flavor.name.split(' ')[0]}
        </Text>
      )}
    </G>
  );
});

FlavorBubble.displayName = 'FlavorBubble';
