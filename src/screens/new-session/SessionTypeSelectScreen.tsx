/**
 * Session Type Select Screen
 *
 * First step in creating a new tasting session.
 * User selects session type: single-coffee, multi-coffee, or table-cupping.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NewSessionNavigationProp } from '../../navigation/types';
import type { SessionType } from '../../types/session.types';
import { useSessionActions } from '../../store';
import { colors, typography, spacing } from '../../theme';

interface SessionTypeOption {
  type: SessionType;
  title: string;
  description: string;
}

const SESSION_TYPES: SessionTypeOption[] = [
  {
    type: 'single-coffee',
    title: 'Single Coffee',
    description: 'Taste and evaluate one coffee',
  },
  {
    type: 'multi-coffee',
    title: 'Multi Coffee',
    description: 'Compare multiple coffees side-by-side',
  },
  {
    type: 'table-cupping',
    title: 'Table Cupping',
    description: 'Professional cupping with 5 cups per coffee',
  },
];

export const SessionTypeSelectScreen: React.FC = () => {
  const navigation = useNavigation<NewSessionNavigationProp>();
  const { createSession } = useSessionActions();

  const handleSelectType = async (type: SessionType) => {
    await createSession(type);
    navigation.navigate('CoffeeSetup', { sessionType: type });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start New Tasting</Text>
      <Text style={styles.subtitle}>Choose your session type</Text>

      {SESSION_TYPES.map(option => (
        <TouchableOpacity
          key={option.type}
          style={styles.optionCard}
          onPress={() => handleSelectType(option.type)}
        >
          <Text style={styles.optionTitle}>{option.title}</Text>
          <Text style={styles.optionDescription}>{option.description}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    ...typography.heading1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionTitle: {
    ...typography.heading3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  optionDescription: {
    ...typography.body,
    color: colors.text.secondary,
  },
});
