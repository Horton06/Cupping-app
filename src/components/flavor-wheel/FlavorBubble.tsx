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
  const fillOpacity = isSelected ? 0.3 + (intensity * 0.14) : 0.2; // 0.3-0.85 based on intensity
  const strokeOpacity = isSelected ? 1 : 0.7;

  // Calculate luminance to determine if text should be light or dark
  const colorToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgb = colorToRgb(flavor.color);
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  const textColor = luminance > 0.6 ? '#000000' : '#ffffff';

  // Adjust font size based on name length
  const nameLength = flavor.name.length;
  let fontSize = 11;
  if (nameLength > 12) fontSize = 9;
  if (nameLength > 16) fontSize = 8;
  if (nameLength > 20) fontSize = 7;

  // Split long names into multiple lines
  const words = flavor.name.split(' ');
  const lines: string[] = [];
  if (words.length > 1 && nameLength > 12) {
    // Multi-word: split into lines
    let currentLine = '';
    words.forEach((word, i) => {
      if (currentLine.length + word.length > 10 && currentLine.length > 0) {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine += (currentLine ? ' ' : '') + word;
      }
      if (i === words.length - 1) {
        lines.push(currentLine.trim());
      }
    });
  } else {
    lines.push(flavor.name);
  }

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
          strokeOpacity={0.9}
        />
      )}

      {/* Flavor name label */}
      {lines.map((line, index) => {
        const lineOffset = (lines.length - 1) * -fontSize / 2 + index * fontSize;
        return (
          <Text
            key={`${flavor.id}-line-${index}`}
            x={x}
            y={y + lineOffset}
            fontSize={fontSize}
            fill={textColor}
            fillOpacity={0.95}
            fontWeight="600"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {line}
          </Text>
        );
      })}
    </G>
  );
});

FlavorBubble.displayName = 'FlavorBubble';
