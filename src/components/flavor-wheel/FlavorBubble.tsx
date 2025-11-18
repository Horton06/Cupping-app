/**
 * FlavorBubble Component
 *
 * Individual flavor bubble for the flavor wheel.
 * Rendered using SVG for optimal performance.
 */

import React, { memo } from 'react';
import { Circle, G } from 'react-native-svg';
import Animated from 'react-native-reanimated';
import type { Flavor } from '../../types/flavor.types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

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
    <AnimatedG onPress={() => onPress(flavor)}>
      {/* Main bubble circle */}
      <AnimatedCircle
        cx={x}
        cy={y}
        r={radius}
        fill={flavor.color}
        fillOpacity={fillOpacity}
        stroke={flavor.color}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
      />

      {/* Selection ring for selected flavors */}
      {isSelected && (
        <AnimatedCircle
          cx={x}
          cy={y}
          r={radius + 4}
          fill="none"
          stroke={flavor.color}
          strokeWidth={3}
          strokeOpacity={0.8}
        />
      )}
    </AnimatedG>
  );
});

FlavorBubble.displayName = 'FlavorBubble';
