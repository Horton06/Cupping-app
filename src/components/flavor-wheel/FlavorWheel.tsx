/**
 * FlavorWheel Component
 *
 * Interactive flavor wheel with 132 flavors in concentric circles.
 * Features:
 * - Pan and pinch-to-zoom gestures
 * - Viewport culling (only render visible bubbles)
 * - Smooth animations with Reanimated
 * - Selection state management
 */

import React, { useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import Svg from 'react-native-svg';
import { FlavorBubble } from './FlavorBubble';
import { useFlavorWheel } from './useFlavorWheel';
import type { Flavor, SelectedFlavor } from '../../types/flavor.types';
import { colors } from '../../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const CANVAS_SIZE = 900; // Size of the flavor wheel canvas
const BUBBLE_RADIUS = 20; // Base bubble radius
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

export interface FlavorWheelProps {
  selectedFlavors?: SelectedFlavor[];
  onSelectionChange?: (flavors: SelectedFlavor[]) => void;
  maxSelections?: number;
}

export const FlavorWheel: React.FC<FlavorWheelProps> = ({
  selectedFlavors: initialSelected = [],
  onSelectionChange,
  maxSelections = 10,
}) => {
  const {
    bubblePositions,
    flavorMap,
    translateX,
    translateY,
    scale,
    toggleFlavor,
    isFlavorSelected,
    getFlavorIntensity,
  } = useFlavorWheel({
    initialSelectedFlavors: initialSelected,
    onSelectionChange,
    maxSelections,
  });

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onChange((event) => {
      translateX.value += event.changeX / scale.value;
      translateY.value += event.changeY / scale.value;
    });

  // Pinch gesture
  const pinchGesture = Gesture.Pinch()
    .onChange((event) => {
      const newScale = Math.min(Math.max(scale.value * event.scale, MIN_SCALE), MAX_SCALE);
      scale.value = newScale;
    })
    .onEnd(() => {
      scale.value = withSpring(
        Math.min(Math.max(scale.value, MIN_SCALE), MAX_SCALE),
        { damping: 20, stiffness: 90 }
      );
    });

  // Compose gestures
  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  // Animated style for the SVG container
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Viewport culling: only render bubbles that are visible
  const visibleBubbles = useMemo(() => {
    const viewportPadding = 100; // Extra padding to avoid popping
    const minX = -translateX.value - viewportPadding;
    const maxX = -translateX.value + SCREEN_WIDTH / scale.value + viewportPadding;
    const minY = -translateY.value - viewportPadding;
    const maxY = -translateY.value + SCREEN_HEIGHT / scale.value + viewportPadding;

    return bubblePositions.filter(pos => {
      const x = pos.x || 0;
      const y = pos.y || 0;
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    });
  }, [bubblePositions, translateX.value, translateY.value, scale.value]);

  // Handle bubble press
  const handleBubblePress = (flavor: Flavor) => {
    runOnJS(toggleFlavor)(flavor);
  };

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Svg
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
        >
          {/* Render only visible bubbles */}
          {visibleBubbles.map(position => {
            const flavor = flavorMap.get(position.number);
            if (!flavor) return null;

            const isSelected = isFlavorSelected(flavor.id);
            const intensity = getFlavorIntensity(flavor.id);

            return (
              <FlavorBubble
                key={position.tempId}
                flavor={flavor}
                x={position.x || 0}
                y={position.y || 0}
                radius={BUBBLE_RADIUS}
                isSelected={isSelected}
                intensity={intensity}
                onPress={handleBubblePress}
              />
            );
          })}
        </Svg>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: colors.background,
  },
});
