/**
 * FlavorWheel Component
 *
 * Interactive flavor wheel with 132 flavors in concentric circles.
 * Features:
 * - Pan and pinch-to-zoom gestures
 * - Tap to select flavors
 * - Smooth animations with Reanimated
 */

import React, { useState, useCallback } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useSharedValue,
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
    toggleFlavor,
    isFlavorSelected,
    getFlavorIntensity,
  } = useFlavorWheel({
    initialSelectedFlavors: initialSelected,
    onSelectionChange,
    maxSelections,
  });

  // Center the wheel initially
  const initialX = (SCREEN_WIDTH - CANVAS_SIZE) / 2;
  const initialY = (SCREEN_HEIGHT - CANVAS_SIZE) / 2;

  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const scale = useSharedValue(1);
  const isPanning = useSharedValue(false);

  // Pan gesture with minimum movement threshold
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isPanning.value = true;
    })
    .onChange((event) => {
      translateX.value += event.changeX;
      translateY.value += event.changeY;
    })
    .onEnd(() => {
      // Small delay to prevent tap from firing after pan
      setTimeout(() => {
        'worklet';
        isPanning.value = false;
      }, 50);
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

  // Handle bubble press - check if we're not panning
  const handleBubblePress = useCallback((flavor: Flavor) => {
    if (!isPanning.value) {
      toggleFlavor(flavor);
    }
  }, [toggleFlavor, isPanning]);

  console.log(`[FlavorWheel] Rendering ${bubblePositions.length} bubbles`);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Svg
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
        >
          {/* Render all bubbles - no viewport culling for now */}
          {bubblePositions.map(position => {
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
                onPress={() => {
                  if (!isPanning.value) {
                    handleBubblePress(flavor);
                  }
                }}
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
