/**
 * Comparison Screen
 *
 * Side-by-side comparison of multiple coffees from a session.
 * Features:
 * - Dual radar charts for visual score comparison
 * - Score delta calculations
 * - Flavor overlap and unique flavor analysis
 * - Coffee metadata comparison
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { HistoryStackParamList } from '../../navigation/types';
import { Card, Divider, ErrorState, LoadingSpinner } from '../../components';
import { RadarChart } from '../../components/SessionSummary/RadarChart';
import { sessionService } from '../../services/sessionService';
import { analyticsService } from '../../services/analyticsService';
import type { Session, CoffeeEntry } from '../../types/session.types';
import type { CoffeeComparison } from '../../services/analyticsService';
import { colors, spacing, typography } from '../../theme';
import { handleError } from '../../utils/errorHandling';

type ComparisonRouteProp = RouteProp<HistoryStackParamList, 'Comparison'>;

export const ComparisonScreen: React.FC = () => {
  const route = useRoute<ComparisonRouteProp>();
  const { sessionId, coffeeId1: initialCoffeeId1, coffeeId2: initialCoffeeId2 } = route.params;

  const [session, setSession] = useState<Session | null>(null);
  const [selectedCoffee1, setSelectedCoffee1] = useState<string | null>(initialCoffeeId1 || null);
  const [selectedCoffee2, setSelectedCoffee2] = useState<string | null>(initialCoffeeId2 || null);
  const [comparison, setComparison] = useState<CoffeeComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSCAScores, setShowSCAScores] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Load session
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await sessionService.getSession(sessionId);
        setSession(data);

        // Auto-select first two coffees if not provided
        if (data && data.coffees.length >= 2) {
          if (!selectedCoffee1) {
            setSelectedCoffee1(data.coffees[0].coffeeId);
          }
          if (!selectedCoffee2) {
            setSelectedCoffee2(data.coffees[1].coffeeId);
          }
        }
      } catch (err) {
        const errorMessage = handleError(err, 'ComparisonScreen.loadSession');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId, selectedCoffee1, selectedCoffee2, retryCount]);

  // Load comparison data
  useEffect(() => {
    const loadComparison = async () => {
      if (!selectedCoffee1 || !selectedCoffee2) {
        setComparison(null);
        return;
      }

      try {
        const data = await analyticsService.getCoffeeComparison(
          sessionId,
          selectedCoffee1,
          selectedCoffee2
        );
        setComparison(data);
      } catch (error) {
        console.error('[Comparison] Error loading comparison:', error);
      }
    };

    loadComparison();
  }, [sessionId, selectedCoffee1, selectedCoffee2]);

  if (loading || !session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner message="Loading comparison..." />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          title="Failed to Load Comparison"
          message={error}
          action={{
            title: 'Try Again',
            onPress: () => setRetryCount((prev) => prev + 1),
          }}
        />
      </SafeAreaView>
    );
  }

  if (session.coffees.length < 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            This session needs at least 2 coffees for comparison
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const coffee1 = session.coffees.find((c) => c.coffeeId === selectedCoffee1);
  const coffee2 = session.coffees.find((c) => c.coffeeId === selectedCoffee2);

  // Calculate average scores for each coffee
  const getAverageScores = (coffee: CoffeeEntry) => {
    const cupCount = coffee.cups.length;
    const avgScores = {
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

      return {
        sweetness: avgScores.sweetness / cupCount,
        acidity: avgScores.acidity / cupCount,
        body: avgScores.body / cupCount,
        clarity: avgScores.clarity / cupCount,
        finish: avgScores.finish / cupCount,
      };
    }

    return avgScores;
  };

  const scores1 = coffee1 ? getAverageScores(coffee1) : null;
  const scores2 = coffee2 ? getAverageScores(coffee2) : null;

  // Get flavors for each coffee
  const flavors1 = coffee1
    ? coffee1.cups.flatMap((cup) => cup.flavors || []).map((f) => f.flavorId)
    : [];
  const flavors2 = coffee2
    ? coffee2.cups.flatMap((cup) => cup.flavors || []).map((f) => f.flavorId)
    : [];

  const uniqueFlavors1 = [...new Set(flavors1)];
  const uniqueFlavors2 = [...new Set(flavors2)];
  const overlapFlavors = uniqueFlavors1.filter((f) => uniqueFlavors2.includes(f));
  const uniqueToFirst = uniqueFlavors1.filter((f) => !uniqueFlavors2.includes(f));
  const uniqueToSecond = uniqueFlavors2.filter((f) => !uniqueFlavors1.includes(f));

  // Coffee selector
  const renderCoffeeSelector = (
    label: string,
    selected: string | null,
    onSelect: (coffeeId: string) => void
  ) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <View style={styles.selectorChips}>
        {session.coffees.map((coffee) => (
          <TouchableOpacity
            key={coffee.coffeeId}
            style={[
              styles.selectorChip,
              selected === coffee.coffeeId && styles.selectorChipActive,
            ]}
            onPress={() => onSelect(coffee.coffeeId)}
          >
            <Text
              style={[
                styles.selectorChipText,
                selected === coffee.coffeeId && styles.selectorChipTextActive,
              ]}
              numberOfLines={1}
            >
              {coffee.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Coffee Selectors */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Select Coffees to Compare</Text>
          {renderCoffeeSelector('Coffee A', selectedCoffee1, setSelectedCoffee1)}
          {renderCoffeeSelector('Coffee B', selectedCoffee2, setSelectedCoffee2)}
        </Card>

        {coffee1 && coffee2 && scores1 && scores2 && (
          <>
            {/* Side-by-Side Radar Charts */}
            <Card style={styles.section}>
              <View style={styles.chartHeader}>
                <Text style={styles.sectionTitle}>Visual Comparison</Text>
                <TouchableOpacity onPress={() => setShowSCAScores(!showSCAScores)}>
                  <Text style={styles.scaleToggle}>
                    {showSCAScores ? 'Show 1-5' : 'Show SCA (6-10)'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.chartsRow}>
                <View style={styles.chartColumn}>
                  <Text style={styles.chartLabel} numberOfLines={1}>
                    {coffee1.name}
                  </Text>
                  <RadarChart
                    scores={scores1 as import('../../types/session.types').StructuralScores}
                    showSCAScores={showSCAScores}
                    size={150}
                  />
                </View>

                <View style={styles.chartColumn}>
                  <Text style={styles.chartLabel} numberOfLines={1}>
                    {coffee2.name}
                  </Text>
                  <RadarChart
                    scores={scores2 as import('../../types/session.types').StructuralScores}
                    showSCAScores={showSCAScores}
                    size={150}
                  />
                </View>
              </View>
            </Card>

            {/* Score Deltas */}
            {comparison && (
              <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Score Differences</Text>
                <Text style={styles.helperText}>
                  Positive values favor {coffee1.name}, negative favor {coffee2.name}
                </Text>

                <View style={styles.deltaList}>
                  {Object.entries(comparison.scoreDelta).map(([key, delta]) => {
                    const absDelta = Math.abs(delta);
                    const displayDelta = showSCAScores ? delta : delta;
                    const isFavorFirst = delta > 0;
                    const deltaColor =
                      absDelta < 0.5
                        ? colors.text.tertiary
                        : isFavorFirst
                          ? colors.primary
                          : colors.warning;

                    return (
                      <View key={key} style={styles.deltaRow}>
                        <Text style={styles.deltaAttribute}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Text>
                        <Text style={[styles.deltaValue, { color: deltaColor }]}>
                          {displayDelta > 0 ? '+' : ''}
                          {displayDelta.toFixed(2)}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <Divider spacing="medium" />

                <View style={styles.overallDelta}>
                  <Text style={styles.overallDeltaLabel}>Overall Difference</Text>
                  <Text
                    style={[
                      styles.overallDeltaValue,
                      {
                        color:
                          comparison.scoreDelta.total > 0 ? colors.primary : colors.warning,
                      },
                    ]}
                  >
                    {comparison.scoreDelta.total > 0 ? '+' : ''}
                    {comparison.scoreDelta.total.toFixed(2)}
                  </Text>
                </View>
              </Card>
            )}

            {/* Flavor Analysis */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Flavor Analysis</Text>

              <View style={styles.flavorStats}>
                <View style={styles.flavorStat}>
                  <Text style={styles.flavorStatValue}>{overlapFlavors.length}</Text>
                  <Text style={styles.flavorStatLabel}>Shared Flavors</Text>
                </View>
                <View style={styles.flavorStat}>
                  <Text style={styles.flavorStatValue}>{uniqueToFirst.length}</Text>
                  <Text style={styles.flavorStatLabel}>Unique to A</Text>
                </View>
                <View style={styles.flavorStat}>
                  <Text style={styles.flavorStatValue}>{uniqueToSecond.length}</Text>
                  <Text style={styles.flavorStatLabel}>Unique to B</Text>
                </View>
              </View>

              {comparison && (() => {
                // Calculate flavor overlap percentage
                const totalUnique = comparison.sharedFlavors.length +
                  comparison.uniqueToCoffee1.length +
                  comparison.uniqueToCoffee2.length;
                const overlapPercent = totalUnique > 0
                  ? (comparison.sharedFlavors.length / totalUnique) * 100
                  : 0;

                return (
                  <>
                    <Divider spacing="medium" />

                    <View style={styles.flavorSimilarity}>
                      <Text style={styles.flavorSimilarityLabel}>
                        Flavor Similarity
                      </Text>
                      <View style={styles.similarityBarContainer}>
                        <View
                          style={[
                            styles.similarityBar,
                            { width: `${overlapPercent}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.flavorSimilarityValue}>
                        {overlapPercent.toFixed(0)}% similar
                      </Text>
                    </View>
                  </>
                );
              })()}
            </Card>

            {/* Metadata Comparison */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Coffee Details</Text>

              <View style={styles.metadataComparison}>
                <View style={styles.metadataColumn}>
                  <Text style={styles.metadataHeader}>{coffee1.name}</Text>
                  {coffee1.roaster && (
                    <Text style={styles.metadataText}>Roaster: {coffee1.roaster}</Text>
                  )}
                  {coffee1.origin && (
                    <Text style={styles.metadataText}>Origin: {coffee1.origin}</Text>
                  )}
                  {coffee1.roastLevel && (
                    <Text style={styles.metadataText}>
                      Roast: {coffee1.roastLevel}
                    </Text>
                  )}
                </View>

                <View style={styles.metadataDivider} />

                <View style={styles.metadataColumn}>
                  <Text style={styles.metadataHeader}>{coffee2.name}</Text>
                  {coffee2.roaster && (
                    <Text style={styles.metadataText}>Roaster: {coffee2.roaster}</Text>
                  )}
                  {coffee2.origin && (
                    <Text style={styles.metadataText}>Origin: {coffee2.origin}</Text>
                  )}
                  {coffee2.roastLevel && (
                    <Text style={styles.metadataText}>
                      Roast: {coffee2.roastLevel}
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          </>
        )}
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
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  helperText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  selectorContainer: {
    marginBottom: spacing.md,
  },
  selectorLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  selectorChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm / 2,
  },
  selectorChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: '48%',
    marginHorizontal: spacing.sm / 2,
    marginBottom: spacing.sm,
  },
  selectorChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectorChipText: {
    ...typography.body,
    color: colors.text.primary,
  },
  selectorChipTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scaleToggle: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  chartsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: -spacing.md / 2,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.md / 2,
  },
  chartLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  deltaList: {
    marginVertical: -spacing.sm / 2,
  },
  deltaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    marginVertical: spacing.sm / 2,
  },
  deltaAttribute: {
    ...typography.body,
    color: colors.text.primary,
  },
  deltaValue: {
    ...typography.body,
    fontWeight: 'bold',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  overallDelta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overallDeltaLabel: {
    ...typography.heading4,
    color: colors.text.primary,
  },
  overallDeltaValue: {
    ...typography.heading3,
    fontWeight: 'bold',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  flavorStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  flavorStat: {
    alignItems: 'center',
  },
  flavorStatValue: {
    ...typography.heading2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  flavorStatLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xs / 2,
  },
  flavorSimilarity: {
    marginVertical: -spacing.sm / 2,
  },
  flavorSimilarityLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
    marginVertical: spacing.sm / 2,
  },
  similarityBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: spacing.xs,
    overflow: 'hidden',
    marginVertical: spacing.sm / 2,
  },
  similarityBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: spacing.xs,
  },
  flavorSimilarityValue: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'right',
    marginVertical: spacing.sm / 2,
  },
  metadataComparison: {
    flexDirection: 'row',
    marginHorizontal: -spacing.md / 2,
  },
  metadataColumn: {
    flex: 1,
    marginHorizontal: spacing.md / 2,
  },
  metadataHeader: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  metadataText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  metadataDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
});
