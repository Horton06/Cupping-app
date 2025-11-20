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

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const CANVAS_SIZE = 900; // Size of the flavor wheel canvas
const CANVAS_CENTER = 450; // Center of 900x900 canvas
const BUBBLE_RADIUS = 40; // Bubble radius (matches web mockup honeycomb layout)
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

// Initial viewBox configuration - start zoomed in to show a 500x500 window centered on the wheel
const INITIAL_VIEW_SIZE = 500;
const INITIAL_VIEW_X = CANVAS_CENTER - INITIAL_VIEW_SIZE / 2; // 200
const INITIAL_VIEW_Y = CANVAS_CENTER - INITIAL_VIEW_SIZE / 2; // 200

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

  // Transform values for pan and zoom (simpler than animating viewBox)
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const panDistance = useSharedValue(0);

  // Handle tap on the wheel - find and toggle flavor
  const handleTap = useCallback((screenX: number, screenY: number, currentScale: number, currentTranslateX: number, currentTranslateY: number) => {
    // Convert screen coordinates to SVG coordinates
    // Step 1: Map screen coords to base SVG coords (accounting for viewBox)
    const baseSvgX = INITIAL_VIEW_X + (screenX / SCREEN_WIDTH) * INITIAL_VIEW_SIZE;
    const baseSvgY = INITIAL_VIEW_Y + (screenY / SCREEN_HEIGHT) * INITIAL_VIEW_SIZE;

    // Step 2: Reverse the transform (scale and translate around center)
    const svgX = ((baseSvgX - CANVAS_CENTER) / currentScale) + CANVAS_CENTER - currentTranslateX;
    const svgY = ((baseSvgY - CANVAS_CENTER) / currentScale) + CANVAS_CENTER - currentTranslateY;

    console.log('[FlavorWheel] Tap at screen:', screenX, screenY, '→ base SVG:', baseSvgX, baseSvgY, '→ transformed SVG:', svgX, svgY);

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
      panDistance.value = 0;
    })
    .onChange((event) => {
      'worklet';
      // Track total distance moved
      panDistance.value += Math.abs(event.changeX) + Math.abs(event.changeY);

      // Only pan if moved more than 10px total
      if (panDistance.value > 10) {
        // Update translation directly (no viewBox conversion needed)
        translateX.value += event.changeX;
        translateY.value += event.changeY;
        console.log('[FlavorWheel] Panning, translate:', translateX.value, translateY.value);
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
          scale.value,
          translateX.value,
          translateY.value
        );
      } else {
        console.log('[FlavorWheel] Detected pan, distance:', panDistance.value, 'final translate:', translateX.value, translateY.value);
      }
      panDistance.value = 0;
    });

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onChange((event) => {
      'worklet';
      // Update scale directly
      const newScale = scale.value * event.scale;
      const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
      scale.value = clampedScale;
      console.log('[FlavorWheel] Pinching, scale:', scale.value);
    })
    .onEnd(() => {
      'worklet';
      scale.value = withSpring(scale.value, {
        damping: 20,
        stiffness: 90,
      });
    });

  // Compose gestures - Pan handles both taps and drags, Pinch runs simultaneously
  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  console.log(`[FlavorWheel] Rendering ${bubblePositions.length} bubbles`);

  // Animated G element
  const AnimatedG = Animated.createAnimatedComponent(G);

  // Animated props for the G transform
  // Transform origin is the center of the canvas (450, 450)
  const groupAnimatedProps = useAnimatedProps(() => ({
    transform: `translate(${translateX.value}, ${translateY.value}) scale(${scale.value})`,
    transformOrigin: `${CANVAS_CENTER} ${CANVAS_CENTER}`,
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={styles.container}>
        <Svg
          width="100%"
          height="100%"
          viewBox={`${INITIAL_VIEW_X} ${INITIAL_VIEW_Y} ${INITIAL_VIEW_SIZE} ${INITIAL_VIEW_SIZE}`}
        >
          <AnimatedG animatedProps={groupAnimatedProps}>
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
          </AnimatedG>
        </Svg>
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
