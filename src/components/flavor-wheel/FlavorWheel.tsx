/**
 * FlavorWheel Component
 *
 * Interactive flavor wheel with 132 flavors in honeycomb ring layout.
 * Features:
 * - Pan and pinch-to-zoom gestures
 * - Tap to select flavors
 * - Smooth animations with Reanimated
 * - Honeycomb arrangement: 4 rings (24, 30, 36, 42 bubbles)
 */

import React, { useCallback } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, Text as SvgText, G } from 'react-native-svg';
import { FlavorBubble } from './FlavorBubble';
import { useFlavorWheel } from './useFlavorWheel';
import type { Flavor, SelectedFlavor } from '../../types/flavor.types';
import { colors } from '../../theme';

// Create animated SVG component
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const CANVAS_SIZE = 900; // Size of the flavor wheel canvas
const BUBBLE_RADIUS = 40; // Bubble radius (matches web mockup honeycomb layout)
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

// SVG viewBox configuration - show a window into the 900x900 canvas
const INITIAL_VIEW_SIZE = 500;
const CANVAS_CENTER = 450; // Center of 900x900 canvas

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

  // ViewBox in SVG coordinates - start centered on the canvas
  const viewBoxX = useSharedValue(CANVAS_CENTER - INITIAL_VIEW_SIZE / 2);
  const viewBoxY = useSharedValue(CANVAS_CENTER - INITIAL_VIEW_SIZE / 2);
  const viewBoxWidth = useSharedValue(INITIAL_VIEW_SIZE);
  const viewBoxHeight = useSharedValue(INITIAL_VIEW_SIZE);

  const isPanning = useSharedValue(false);
  const panDistance = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // Handle tap on the wheel - find and toggle flavor
  const handleTap = useCallback((screenX: number, screenY: number, svgViewBoxX: number, svgViewBoxY: number, svgViewBoxWidth: number, svgViewBoxHeight: number) => {
    // Convert screen coordinates to SVG coordinates
    const svgX = svgViewBoxX + (screenX / SCREEN_WIDTH) * svgViewBoxWidth;
    const svgY = svgViewBoxY + (screenY / SCREEN_HEIGHT) * svgViewBoxHeight;

    console.log('[FlavorWheel] Tap at screen:', screenX, screenY, '→ SVG:', svgX, svgY);

    // Find bubble at this position
    for (const position of bubblePositions) {
      const dx = svgX - (position.x || 0);
      const dy = svgY - (position.y || 0);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= BUBBLE_RADIUS) {
        const flavor = flavorMap.get(position.number);
        if (flavor) {
          console.log('[FlavorWheel] Found flavor:', flavor.name, 'at distance:', distance);
          toggleFlavor(flavor);
          return;
        }
      }
    }
    console.log('[FlavorWheel] No flavor found at tap position');
  }, [bubblePositions, flavorMap, toggleFlavor]);

  // Pan gesture - also handles taps
  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      'worklet';
      startX.value = event.x;
      startY.value = event.y;
      panDistance.value = 0;
      isPanning.value = false;
    })
    .onChange((event) => {
      'worklet';
      // Track total distance moved
      panDistance.value += Math.abs(event.changeX) + Math.abs(event.changeY);

      // Only pan if moved more than 10px total
      if (panDistance.value > 10) {
        isPanning.value = true;

        // Convert screen delta to SVG delta (accounting for current zoom)
        const svgDeltaX = -event.changeX * (viewBoxWidth.value / SCREEN_WIDTH);
        const svgDeltaY = -event.changeY * (viewBoxHeight.value / SCREEN_HEIGHT);

        viewBoxX.value += svgDeltaX;
        viewBoxY.value += svgDeltaY;
      }
    })
    .onEnd((event) => {
      'worklet';
      // If didn't move much, it was a tap
      if (panDistance.value < 10) {
        console.log('[FlavorWheel] Detected tap, distance:', panDistance.value);
        runOnJS(handleTap)(
          event.x,
          event.y,
          viewBoxX.value,
          viewBoxY.value,
          viewBoxWidth.value,
          viewBoxHeight.value
        );
      } else {
        console.log('[FlavorWheel] Detected pan, distance:', panDistance.value);
      }
      isPanning.value = false;
      panDistance.value = 0;
    });

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onChange((event) => {
      const centerX = viewBoxX.value + viewBoxWidth.value / 2;
      const centerY = viewBoxY.value + viewBoxHeight.value / 2;

      const newWidth = viewBoxWidth.value / event.scale;
      const newHeight = viewBoxHeight.value / event.scale;

      // Clamp zoom level
      const minSize = CANVAS_SIZE / MAX_SCALE;
      const maxSize = CANVAS_SIZE / MIN_SCALE;
      const clampedWidth = Math.max(minSize, Math.min(maxSize, newWidth));
      const clampedHeight = Math.max(minSize, Math.min(maxSize, newHeight));

      viewBoxWidth.value = clampedWidth;
      viewBoxHeight.value = clampedHeight;

      // Keep zoom centered on pinch point
      viewBoxX.value = centerX - clampedWidth / 2;
      viewBoxY.value = centerY - clampedHeight / 2;
    })
    .onEnd(() => {
      viewBoxWidth.value = withSpring(viewBoxWidth.value, {
        damping: 20,
        stiffness: 90,
      });
      viewBoxHeight.value = withSpring(viewBoxHeight.value, {
        damping: 20,
        stiffness: 90,
      });
    });

  // Compose gestures - Pan handles both taps and drags, Pinch runs simultaneously
  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  // Animated SVG viewBox props
  const animatedProps = useAnimatedProps(() => ({
    viewBox: `${viewBoxX.value} ${viewBoxY.value} ${viewBoxWidth.value} ${viewBoxHeight.value}`,
  }));

  // Animated container style
  const animatedStyle = useAnimatedStyle(() => ({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  }));

  console.log(`[FlavorWheel] Rendering ${bubblePositions.length} bubbles`);
  console.log('[FlavorWheel] ViewBox:', `${viewBoxX.value},${viewBoxY.value} ${viewBoxWidth.value}x${viewBoxHeight.value}`);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <AnimatedSvg
          width="100%"
          height="100%"
          animatedProps={animatedProps}
        >
          {/* Center point marker for debugging */}
          <Circle
            cx={CANVAS_CENTER}
            cy={CANVAS_CENTER}
            r={5}
            fill="red"
          />

          {/* Reference circles */}
          <Circle
            cx={CANVAS_CENTER}
            cy={CANVAS_CENTER}
            r={100}
            fill="none"
            stroke="#333"
            strokeWidth={1}
          />
          <Circle
            cx={CANVAS_CENTER}
            cy={CANVAS_CENTER}
            r={300}
            fill="none"
            stroke="#333"
            strokeWidth={1}
          />

          {/* Center text */}
          <G>
            <SvgText
              x={CANVAS_CENTER}
              y={CANVAS_CENTER - 10}
              textAnchor="middle"
              fontSize={18}
              fontWeight="bold"
              fill="#ffffff"
            >
              COFFEE FLAVOR
            </SvgText>
            <SvgText
              x={CANVAS_CENTER}
              y={CANVAS_CENTER + 15}
              textAnchor="middle"
              fontSize={16}
              fill="#ffffff"
            >
              WHEEL
            </SvgText>
            <SvgText
              x={CANVAS_CENTER}
              y={CANVAS_CENTER + 35}
              textAnchor="middle"
              fontSize={12}
              fill="#888888"
            >
              Tap any flavor
            </SvgText>
          </G>

          {/* Render all bubbles */}
          {bubblePositions.map(position => {
            const flavor = flavorMap.get(position.number);
            if (!flavor) {
              console.warn('[FlavorWheel] No flavor found for position:', position.number);
              return null;
            }

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
                onPress={() => {}} // No-op: taps handled by gesture detector
              />
            );
          })}
        </AnimatedSvg>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
