/**
 * Session Detail Screen
 *
 * Comprehensive read-only view of a completed tasting session.
 * Shows all session data including scores, flavors, and notes.
 * Used in the History tab for viewing past sessions.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type {
  SessionDetailRouteProp,
  HistoryDetailRouteProp,
  HistoryNavigationProp,
} from '../../navigation/types';
import { Card, Badge, Divider, Button } from '../../components';
import { RadarChart } from '../../components/SessionSummary/RadarChart';
import { FlavorChips } from '../../components/SessionSummary/FlavorChips';
import { sessionService } from '../../services/sessionService';
import type { Session } from '../../types/session.types';
import { colors, spacing, typography } from '../../theme';

export const SessionDetailScreen: React.FC = () => {
  const route = useRoute<SessionDetailRouteProp | HistoryDetailRouteProp>();
  const navigation = useNavigation<HistoryNavigationProp>();
  const { sessionId } = route.params;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSCAScores, setShowSCAScores] = useState(false);

  // Load session data
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const data = await sessionService.getSession(sessionId);
        setSession(data);
      } catch (error) {
        console.error('[SessionDetail] Error loading session:', error);
        Alert.alert('Error', 'Failed to load session details.');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  // Toggle SCA scores
  const handleToggleSCAScores = useCallback(() => {
    setShowSCAScores((prev) => !prev);
  }, []);

  // Navigate to comparison screen
  const handleCompare = useCallback(() => {
    if (session && session.coffees.length >= 2) {
      navigation.navigate('Comparison', {
        sessionId: session.id,
        coffeeId1: session.coffees[0].coffeeId,
        coffeeId2: session.coffees[1].coffeeId,
      });
    }
  }, [session, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Session not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const date = new Date(session.createdAt);
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Session Header */}
        <Card style={styles.headerCard}>
          <Text style={styles.sessionType}>{session.sessionType}</Text>
          <Text style={styles.sessionDate}>
            {dateStr} at {timeStr}
          </Text>

          {session.tags && session.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {session.tags.map((tag, idx) => (
                <Badge key={idx} label={tag} variant="default" />
              ))}
            </View>
          )}
        </Card>

        {/* Compare Button - only show if 2+ coffees */}
        {session.coffees.length >= 2 && (
          <Button
            title="Compare Coffees"
            onPress={handleCompare}
            variant="secondary"
            fullWidth
            style={styles.compareButton}
          />
        )}

        {/* Coffee Cards */}
        {session.coffees.map((coffee, coffeeIdx) => {
          // Calculate average scores for this coffee
          const cupCount = coffee.cups.length;
          let avgScores = {
            sweetness: 0,
            acidity: 0,
            body: 0,
            clarity: 0,
            finish: 0,
          };

          if (cupCount > 0) {
            coffee.cups.forEach((cup) => {
              avgScores.sweetness += cup.ratings.sweetness || 0;
              avgScores.acidity += cup.ratings.acidity || 0;
              avgScores.body += cup.ratings.body || 0;
              avgScores.clarity += cup.ratings.clarity || 0;
              avgScores.finish += cup.ratings.finish || 0;
            });

            avgScores = {
              sweetness: avgScores.sweetness / cupCount,
              acidity: avgScores.acidity / cupCount,
              body: avgScores.body / cupCount,
              clarity: avgScores.clarity / cupCount,
              finish: avgScores.finish / cupCount,
            };
          }

          // Get selected flavors from all cups for this coffee
          const allFlavors = coffee.cups.flatMap((cup) => cup.flavors || []);

          return (
            <View key={coffee.coffeeId}>
              {session.coffees.length > 1 && (
                <Text style={styles.coffeeIndex}>Coffee {coffeeIdx + 1}</Text>
              )}

              <Card style={styles.section}>
                {/* Coffee Metadata */}
                <Text style={styles.coffeeName}>{coffee.name}</Text>

                {(coffee.roaster || coffee.origin) && (
                  <View style={styles.coffeeMetadata}>
                    {coffee.roaster && (
                      <View style={styles.metadataRow}>
                        <Text style={styles.metadataLabel}>Roaster:</Text>
                        <Text style={styles.metadataValue}>{coffee.roaster}</Text>
                      </View>
                    )}
                    {coffee.origin && (
                      <View style={styles.metadataRow}>
                        <Text style={styles.metadataLabel}>Origin:</Text>
                        <Text style={styles.metadataValue}>{coffee.origin}</Text>
                      </View>
                    )}
                    {coffee.roastLevel && (
                      <View style={styles.metadataRow}>
                        <Text style={styles.metadataLabel}>Roast:</Text>
                        <Text style={styles.metadataValue}>{coffee.roastLevel}</Text>
                      </View>
                    )}
                    {coffee.roastDate && (
                      <View style={styles.metadataRow}>
                        <Text style={styles.metadataLabel}>Roast Date:</Text>
                        <Text style={styles.metadataValue}>
                          {new Date(coffee.roastDate).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <Divider spacing="medium" />

                {/* Radar Chart */}
                <View style={styles.chartSection}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.sectionTitle}>Structural Scores</Text>
                    <Text style={styles.scaleToggle} onPress={handleToggleSCAScores}>
                      {showSCAScores ? 'Show 1-5' : 'Show SCA (6-10)'}
                    </Text>
                  </View>

                  <RadarChart
                    scores={avgScores as import('../../types/session.types').StructuralScores}
                    size={280}
                    showSCAScores={showSCAScores}
                  />

                  {cupCount > 1 && (
                    <Text style={styles.chartNote}>
                      Average of {cupCount} cup{cupCount > 1 ? 's' : ''}
                    </Text>
                  )}
                </View>

                <Divider spacing="medium" />

                {/* Score Breakdown */}
                <View style={styles.scoresSection}>
                  <Text style={styles.sectionTitle}>Score Breakdown</Text>

                  {Object.entries(avgScores).map(([key, value]) => {
                    const displayValue = showSCAScores ? value + 5 : value;
                    const maxValue = showSCAScores ? 10 : 5;
                    const percentage = (displayValue / maxValue) * 100;

                    return (
                      <View key={key} style={styles.scoreRow}>
                        <View style={styles.scoreLabel}>
                          <Text style={styles.scoreName}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </Text>
                          <Text style={styles.scoreValue}>
                            {displayValue.toFixed(1)}
                          </Text>
                        </View>
                        <View style={styles.scoreBarContainer}>
                          <View
                            style={[
                              styles.scoreBar,
                              { width: `${percentage}%` },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Flavors */}
                {allFlavors.length > 0 && (
                  <>
                    <Divider spacing="medium" />
                    <View style={styles.flavorsSection}>
                      <Text style={styles.sectionTitle}>Flavor Profile</Text>
                      <FlavorChips flavors={allFlavors} />
                    </View>
                  </>
                )}
              </Card>
            </View>
          );
        })}

        {/* Notes */}
        {session.notes && session.notes.trim().length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Tasting Notes</Text>
            <Text style={styles.notesText}>{session.notes}</Text>
          </Card>
        )}

        {/* Session Info */}
        <Card style={styles.infoSection}>
          <Text style={styles.infoLabel}>Session ID</Text>
          <Text style={styles.infoValue}>{session.id}</Text>

          <Divider spacing="small" />

          <Text style={styles.infoLabel}>Created</Text>
          <Text style={styles.infoValue}>
            {new Date(session.createdAt).toLocaleString()}
          </Text>

          <Divider spacing="small" />

          <Text style={styles.infoLabel}>Last Updated</Text>
          <Text style={styles.infoValue}>
            {new Date(session.updatedAt).toLocaleString()}
          </Text>
        </Card>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.tertiary,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
  headerCard: {
    marginBottom: spacing.lg,
  },
  sessionType: {
    ...typography.heading2,
    color: colors.text.primary,
    textTransform: 'capitalize',
    marginBottom: spacing.xs,
  },
  sessionDate: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  compareButton: {
    marginBottom: spacing.lg,
  },
  coffeeIndex: {
    ...typography.heading3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  coffeeName: {
    ...typography.heading3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  coffeeMetadata: {
    gap: spacing.xs,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metadataLabel: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
  metadataValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  chartSection: {
    alignItems: 'center',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading4,
    color: colors.text.primary,
  },
  scaleToggle: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  chartNote: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  scoresSection: {
    gap: spacing.md,
  },
  scoreRow: {
    gap: spacing.xs,
  },
  scoreLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  scoreName: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  scoreValue: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: 'bold',
  },
  scoreBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: spacing.xs,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: spacing.xs,
  },
  flavorsSection: {
    gap: spacing.md,
  },
  notesText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 24,
  },
  infoSection: {
    marginBottom: spacing.lg,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.xs / 2,
  },
  infoValue: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
});
