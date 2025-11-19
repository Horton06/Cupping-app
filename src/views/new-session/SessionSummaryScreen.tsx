/**
 * Session Summary Screen
 *
 * Final screen in session flow showing complete session overview.
 * Displays coffee metadata, radar chart, flavor chips, and action buttons.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type {
  SessionSummaryRouteProp,
  NewSessionNavigationProp,
} from '../../navigation/types';
import type { Session } from '../../types/session.types';
import { Button, Card, LoadingSpinner, Divider } from '../../components';
import { RadarChart } from '../../components/SessionSummary/RadarChart';
import { FlavorChips } from '../../components/SessionSummary/FlavorChips';
import { sessionService } from '../../services/sessionService';
import { analyticsService } from '../../services/analyticsService';
import type { SessionStats } from '../../services/analyticsService';
import { colors, typography, spacing } from '../../theme';

export const SessionSummaryScreen: React.FC = () => {
  const route = useRoute<SessionSummaryRouteProp>();
  const navigation = useNavigation<NewSessionNavigationProp>();
  const { sessionId } = route.params;

  const [session, setSession] = useState<Session | null>(null);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [showSCAScores, setShowSCAScores] = useState(false);
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState(false);

  useEffect(() => {
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const loadSession = async () => {
    setLoading(true);
    try {
      const s = await sessionService.getSession(sessionId);
      const sessionStats = await analyticsService.getSessionStats(sessionId);
      setSession(s);
      setStats(sessionStats);
    } catch (error) {
      console.error('[SessionSummary] Error loading session:', error);
      Alert.alert('Error', 'Failed to load session summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = useCallback(async () => {
    if (!session) return;

    try {
      setDuplicating(true);
      const duplicated = await sessionService.duplicateSession(sessionId);

      Alert.alert(
        'Session Duplicated',
        'A copy of this session has been created. Would you like to edit it now?',
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Edit Now',
            onPress: () => {
              // Navigate to the first coffee of the duplicated session
              if (duplicated.coffees.length > 0) {
                const firstCoffee = duplicated.coffees[0];
                const firstCup = firstCoffee.cups[0];

                navigation.navigate('FlavorSelection', {
                  sessionId: duplicated.id,
                  coffeeId: firstCoffee.coffeeId,
                  cupId: firstCup.cupId,
                });
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('[SessionSummary] Error duplicating session:', error);
      Alert.alert('Error', 'Failed to duplicate session.');
    } finally {
      setDuplicating(false);
    }
  }, [session, sessionId, navigation]);

  const handleFinish = useCallback(() => {
    // Navigate to history or start new session
    Alert.alert(
      'Session Saved',
      'Your tasting session has been saved successfully!',
      [
        {
          text: 'View History',
          onPress: () => {
            // Navigate to History tab
            navigation.getParent()?.navigate('HistoryTab');
          },
        },
        {
          text: 'Start New Session',
          onPress: () => {
            // Navigate back to start of new session flow
            navigation.navigate('SessionTypeSelect');
          },
        },
      ]
    );
  }, [navigation]);

  if (loading || !session) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading summary..." fullScreen />
      </SafeAreaView>
    );
  }

  const coffee = session.coffees[0];
  const cup = coffee?.cups[0];

  if (!coffee || !cup) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Session data incomplete</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  // Calculate total score
  const totalScore =
    (cup.ratings.acidity || 0) +
    (cup.ratings.sweetness || 0) +
    (cup.ratings.body || 0) +
    (cup.ratings.clarity || 0) +
    (cup.ratings.finish || 0) +
    (cup.ratings.enjoyment || 0);

  const scaTotal = showSCAScores ? totalScore + 30 : totalScore;
  const maxScore = showSCAScores ? 60 : 30;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Session Summary</Text>
          <Text style={styles.subtitle}>
            {new Date(session.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Coffee Metadata */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{coffee.name}</Text>
          {coffee.roaster && (
            <Text style={styles.metadata}>Roaster: {coffee.roaster}</Text>
          )}
          {coffee.origin && (
            <Text style={styles.metadata}>Origin: {coffee.origin}</Text>
          )}
          {coffee.roastLevel && (
            <Text style={styles.metadata}>
              Roast: {coffee.roastLevel.charAt(0).toUpperCase() + coffee.roastLevel.slice(1)}
            </Text>
          )}
          {coffee.brewMethod && (
            <Text style={styles.metadata}>Method: {coffee.brewMethod}</Text>
          )}
        </Card>

        {/* Flavors */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Flavors</Text>
          {stats && (
            <Text style={styles.flavorCount}>
              {stats.totalFlavors} flavor{stats.totalFlavors !== 1 ? 's' : ''} selected
              ({stats.uniqueFlavors} unique)
            </Text>
          )}
          <FlavorChips flavors={cup.flavors} />
        </Card>

        {/* Structural Scores */}
        <Card style={styles.section}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Structural Profile</Text>
            <Button
              title={showSCAScores ? '1-5 Scale' : 'SCA Scale'}
              onPress={() => setShowSCAScores(!showSCAScores)}
              variant="secondary"
              size="small"
            />
          </View>

          <RadarChart
            scores={cup.ratings}
            showSCAScores={showSCAScores}
            size={260}
          />

          <View style={styles.totalScore}>
            <Text style={styles.totalScoreLabel}>Total Score</Text>
            <Text style={styles.totalScoreValue}>
              {scaTotal} / {maxScore}
            </Text>
          </View>

          <Divider spacing="medium" />

          {/* Score breakdown */}
          {Object.entries(cup.ratings).map(([attr, value]) => {
            if (attr === 'enjoyment' && !value) return null;

            const displayValue = showSCAScores ? (value || 0) + 5 : value || 0;
            const maxValue = showSCAScores ? 10 : 5;

            return (
              <View key={attr} style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>
                  {attr.charAt(0).toUpperCase() + attr.slice(1)}
                </Text>
                <View style={styles.scoreBar}>
                  <View
                    style={[
                      styles.scoreBarFill,
                      { width: `${(displayValue / maxValue) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.scoreValue}>{displayValue}</Text>
              </View>
            );
          })}
        </Card>

        {/* Session Notes */}
        {session.notes && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{session.notes}</Text>
          </Card>
        )}

        {/* Tags */}
        {session.tags && session.tags.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsList}>
              {session.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Statistics */}
        {stats && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalFlavors}</Text>
                <Text style={styles.statLabel}>Total Flavors</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.uniqueFlavors}</Text>
                <Text style={styles.statLabel}>Unique</Text>
              </View>
              {stats.duration && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.duration}m</Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
              )}
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Duplicate"
          onPress={handleDuplicate}
          loading={duplicating}
          variant="secondary"
          style={styles.actionButton}
        />
        <Button
          title="Finish"
          onPress={handleFinish}
          style={styles.actionButton}
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
    ...typography.heading1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  metadata: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  flavorCount: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  totalScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  totalScoreLabel: {
    ...typography.heading4,
    color: colors.text.primary,
  },
  totalScoreValue: {
    ...typography.heading2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scoreLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    width: 80,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 4,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  scoreValue: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
    width: 30,
    textAlign: 'right',
  },
  notesText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 24,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.primary + '20',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.sm,
  },
  tagText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.heading2,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
