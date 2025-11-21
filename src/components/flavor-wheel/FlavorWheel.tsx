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

import React, { useMemo, useEffect } from 'react';
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

  // Initialize viewport to center the wheel on first render
  // The canvas is 900x900 with center at (450, 450)
  // We need to offset it so the center is visible on screen
  useEffect(() => {
    // Center the wheel - translate so that canvas center (450, 450) is at screen center
    const initialX = (SCREEN_WIDTH / 2) - (CANVAS_SIZE / 2);
    const initialY = (SCREEN_HEIGHT / 2) - (CANVAS_SIZE / 2);
    translateX.value = initialX;
    translateY.value = initialY;
  }, [translateX, translateY]);

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

  // Render all bubbles (viewport culling disabled)
  // Note: Viewport culling with Reanimated shared values requires
  // useAnimatedReaction to trigger re-renders, which was causing
  // bubbles to not appear initially
  const visibleBubbles = useMemo(() => {
    console.log('[FlavorWheel] Rendering', bubblePositions.length, 'bubbles');
    return bubblePositions;
  }, [bubblePositions]);

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
