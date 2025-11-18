/**
 * RadarChart Component
 *
 * SVG-based 5-axis radar chart for structural scores.
 * Supports both 1-5 and SCA (6-10) scales.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';
import type { StructuralScores } from '../../types/session.types';
import { colors } from '../../theme';

export interface RadarChartProps {
  scores: StructuralScores;
  showSCAScores?: boolean;
  size?: number;
}

const ATTRIBUTES: Array<keyof StructuralScores> = [
  'acidity',
  'sweetness',
  'body',
  'clarity',
  'finish',
];

const ATTRIBUTE_LABELS: Record<keyof StructuralScores, string> = {
  acidity: 'Acidity',
  sweetness: 'Sweet',
  body: 'Body',
  clarity: 'Clarity',
  finish: 'Finish',
  enjoyment: 'Overall',
};

export const RadarChart: React.FC<RadarChartProps> = ({
  scores,
  showSCAScores = false,
  size = 240,
}) => {
  const center = size / 2;
  const radius = size / 2 - 40; // Leave space for labels
  const maxValue = showSCAScores ? 10 : 5;
  const minValue = showSCAScores ? 6 : 1;
  const numAxes = ATTRIBUTES.length;

  // Calculate point coordinates for a given value and index
  const getPoint = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / numAxes - Math.PI / 2; // Start at top
    const score = showSCAScores ? value + 5 : value;
    const normalizedValue = (score - minValue) / (maxValue - minValue);
    const r = radius * normalizedValue;

    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Get axis endpoint (max value)
  const getAxisPoint = (index: number) => {
    const angle = (index * 2 * Math.PI) / numAxes - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // Get label position (slightly beyond axis)
  const getLabelPoint = (index: number) => {
    const angle = (index * 2 * Math.PI) / numAxes - Math.PI / 2;
    const labelRadius = radius + 25;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
    };
  };

  // Generate polygon points for the data
  const dataPoints = ATTRIBUTES.map((attr, i) => {
    const value = scores[attr] || 3;
    const point = getPoint(i, value);
    return `${point.x},${point.y}`;
  }).join(' ');

  // Grid levels (concentric polygons)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background grid */}
        {gridLevels.map((level, levelIndex) => {
          const gridPoints = ATTRIBUTES.map((_, i) => {
            const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
            const r = radius * level;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          }).join(' ');

          return (
            <Polygon
              key={levelIndex}
              points={gridPoints}
              fill="none"
              stroke={colors.border}
              strokeWidth={1}
              opacity={0.3}
            />
          );
        })}

        {/* Axis lines */}
        {ATTRIBUTES.map((_, i) => {
          const axisPoint = getAxisPoint(i);
          return (
            <Line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={axisPoint.x}
              y2={axisPoint.y}
              stroke={colors.border}
              strokeWidth={1}
              opacity={0.5}
            />
          );
        })}

        {/* Data polygon */}
        <Polygon
          points={dataPoints}
          fill={colors.primary}
          fillOpacity={0.2}
          stroke={colors.primary}
          strokeWidth={2}
        />

        {/* Data points */}
        {ATTRIBUTES.map((attr, i) => {
          const value = scores[attr] || 3;
          const point = getPoint(i, value);
          return (
            <Circle
              key={`point-${i}`}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={colors.primary}
            />
          );
        })}

        {/* Center point */}
        <Circle cx={center} cy={center} r={3} fill={colors.border} />

        {/* Labels */}
        {ATTRIBUTES.map((attr, i) => {
          const labelPoint = getLabelPoint(i);
          return (
            <SvgText
              key={`label-${i}`}
              x={labelPoint.x}
              y={labelPoint.y}
              fontSize={12}
              fontWeight="600"
              fill={colors.text.primary}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {ATTRIBUTE_LABELS[attr]}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
