/**
 * Structure Scoring Screen
 *
 * Rate structural attributes (acidity, sweetness, body, clarity, finish, enjoyment).
 * Uses ScoreSlider components for 1-5 scale ratings.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { StructureScoringRouteProp, NewSessionNavigationProp } from '../../navigation/types';
import type { StructuralScores, ScoreValue } from '../../types/session.types';
import { ScoreSlider, Button, LoadingSpinner, Divider } from '../../components';
import { sessionService } from '../../services/sessionService';
import { colors, typography, spacing } from '../../theme';

interface ScoreAttribute {
  key: keyof StructuralScores;
  label: string;
  leftLabel: string;
  rightLabel: string;
  description: string;
}

const SCORE_ATTRIBUTES: ScoreAttribute[] = [
  {
    key: 'acidity',
    label: 'Acidity',
    leftLabel: 'Flat',
    rightLabel: 'Bright',
    description: 'The brightness and liveliness of the coffee',
  },
  {
    key: 'sweetness',
    label: 'Sweetness',
    leftLabel: 'Lacking',
    rightLabel: 'Intense',
    description: 'The natural sweetness and pleasant taste',
  },
  {
    key: 'body',
    label: 'Body',
    leftLabel: 'Light',
    rightLabel: 'Heavy',
    description: 'The weight and texture in the mouth',
  },
  {
    key: 'clarity',
    label: 'Clarity',
    leftLabel: 'Muddy',
    rightLabel: 'Clear',
    description: 'The cleanness and definition of flavors',
  },
  {
    key: 'finish',
    label: 'Finish',
    leftLabel: 'Short',
    rightLabel: 'Long',
    description: 'How long the flavors linger after swallowing',
  },
  {
    key: 'enjoyment',
    label: 'Overall Enjoyment',
    leftLabel: 'Poor',
    rightLabel: 'Excellent',
    description: 'Your overall impression of this coffee',
  },
];

export const StructureScoringScreen: React.FC = () => {
  const route = useRoute<StructureScoringRouteProp>();
  const navigation = useNavigation<NewSessionNavigationProp>();
  const { sessionId, cupId } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasMoreCoffees, setHasMoreCoffees] = useState(false);
  const [coffeeNumber, setCoffeeNumber] = useState(1);
  const [totalCoffees, setTotalCoffees] = useState(1);

  // Score state - initialize with default values
  const [scores, setScores] = useState<StructuralScores>({
    acidity: 3,
    sweetness: 3,
    body: 3,
    clarity: 3,
    finish: 3,
    enjoyment: 3,
  });

  // Load existing scores and check progress
  useEffect(() => {
    const loadScores = async () => {
      try {
        setIsLoading(true);
        const session = await sessionService.getSession(sessionId);

        if (session) {
          setTotalCoffees(session.coffees.length);

          // Find the cup in the session and determine position
          let currentCoffeeIndex = -1;
          for (let i = 0; i < session.coffees.length; i++) {
            const coffee = session.coffees[i];
            const cup = coffee.cups.find(c => c.cupId === cupId);
            if (cup) {
              // Load existing scores
              setScores(cup.ratings);
              currentCoffeeIndex = i;
              setCoffeeNumber(i + 1);
              break;
            }
          }

          // Check if there are more coffees after this one
          setHasMoreCoffees(currentCoffeeIndex >= 0 && currentCoffeeIndex < session.coffees.length - 1);
        }
      } catch (error) {
        console.error('[StructureScoring] Error loading scores:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadScores();
  }, [sessionId, cupId]);

  // Update a single score
  const handleScoreChange = useCallback((key: keyof StructuralScores, value: ScoreValue) => {
    setScores(prev => ({ ...prev, [key]: value }));
  }, []);

  // Save scores and continue to next coffee or summary
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);

      // Save scores to database
      await sessionService.updateCupScores(cupId, scores);

      // Get session to check for next coffee
      const session = await sessionService.getSession(sessionId);
      if (!session) {
        console.error('[StructureScoring] Session not found');
        navigation.goBack();
        return;
      }

      // Find current coffee index
      let currentCoffeeIndex = -1;
      for (let i = 0; i < session.coffees.length; i++) {
        const coffee = session.coffees[i];
        const cupExists = coffee.cups.some(c => c.cupId === cupId);
        if (cupExists) {
          currentCoffeeIndex = i;
          break;
        }
      }

      // Check if there's a next coffee
      const nextCoffeeIndex = currentCoffeeIndex + 1;
      if (nextCoffeeIndex < session.coffees.length) {
        // Navigate to next coffee's flavor selection
        const nextCoffee = session.coffees[nextCoffeeIndex];
        const nextCup = nextCoffee.cups[0]; // Use first cup of next coffee

        navigation.navigate('FlavorSelection', {
          sessionId,
          coffeeId: nextCoffee.coffeeId,
          cupId: nextCup.cupId,
        });
      } else {
        // All coffees complete - navigate to session summary
        navigation.navigate('SessionSummary', { sessionId });
      }
    } catch (error) {
      console.error('[StructureScoring] Error saving scores:', error);
    } finally {
      setIsSaving(false);
    }
  }, [cupId, scores, sessionId, navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading scores..." fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rate Structural Attributes</Text>
          <Text style={styles.subtitle}>
            Coffee {coffeeNumber} of {totalCoffees} • Score each attribute on a scale of 1-5
          </Text>
        </View>

        {/* Score Sliders */}
        <View style={styles.scoresContainer}>
          {SCORE_ATTRIBUTES.map((attribute, index) => (
            <View key={attribute.key}>
              <ScoreSlider
                label={attribute.label}
                leftLabel={attribute.leftLabel}
                rightLabel={attribute.rightLabel}
                value={scores[attribute.key] || 3}
                onChange={(value) => handleScoreChange(attribute.key, value)}
              />
              <Text style={styles.description}>{attribute.description}</Text>

              {/* Divider between attributes (except last one) */}
              {index < SCORE_ATTRIBUTES.length - 1 && (
                <Divider spacing="medium" />
              )}
            </View>
          ))}
        </View>

        {/* Score Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Score Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Points:</Text>
            <Text style={styles.summaryValue}>
              {Object.values(scores).reduce((sum, val) => sum + (val || 0), 0)}/30
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Average:</Text>
            <Text style={styles.summaryValue}>
              {(Object.values(scores).reduce((sum, val) => sum + (val || 0), 0) / 6).toFixed(1)}/5
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title={hasMoreCoffees ? `Continue to Coffee ${coffeeNumber + 1}` : 'Finish Session'}
          onPress={handleSave}
          loading={isSaving}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.heading2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  scoresContainer: {
    marginBottom: spacing.xl,
  },
  description: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  summaryTitle: {
    ...typography.heading4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.heading4,
    color: colors.primary,
  },
  actions: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
