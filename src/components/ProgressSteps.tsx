/**
 * ProgressSteps Component
 *
 * Visual progress indicator for multi-step flows.
 * Shows current step and completion status.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

export interface ProgressStep {
  label: string;
  completed: boolean;
}

export interface ProgressStepsProps {
  steps: ProgressStep[];
  currentIndex: number;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  currentIndex,
}) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = step.completed;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={index}>
            {/* Step Circle */}
            <View style={styles.stepContainer}>
              <View
                style={[
                  styles.stepCircle,
                  isActive && styles.stepCircleActive,
                  isCompleted && styles.stepCircleCompleted,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    (isActive || isCompleted) && styles.stepNumberActive,
                  ]}
                >
                  {isCompleted ? '✓' : index + 1}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                ]}
              >
                {step.label}
              </Text>
            </View>

            {/* Connector Line */}
            {!isLast && (
              <View
                style={[
                  styles.connector,
                  isCompleted && styles.connectorCompleted,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  stepCircleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  stepCircleCompleted: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  stepNumber: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
  stepNumberActive: {
    color: colors.background,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    maxWidth: 80,
  },
  stepLabelActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.lg,
  },
  connectorCompleted: {
    backgroundColor: colors.success,
  },
});
