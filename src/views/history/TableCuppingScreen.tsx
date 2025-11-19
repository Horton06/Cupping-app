/**
 * Table Cupping Screen
 *
 * Professional table cupping mode for evaluating multiple cups of the same coffee.
 * Features:
 * - Side-by-side cup comparison
 * - Cup uniformity scoring
 * - Standard deviation analysis
 * - Individual cup details
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { HistoryStackParamList } from '../../navigation/types';
import { Card, Badge, Divider, ErrorState, LoadingSpinner } from '../../components';
import { sessionService } from '../../services/sessionService';
import { analyticsService } from '../../services/analyticsService';
import type { Session, CoffeeEntry, Cup } from '../../types/session.types';
import type { UniformityScore } from '../../services/analyticsService';
import { colors, spacing, typography } from '../../theme';
import { handleError } from '../../utils/errorHandling';

type TableCuppingRouteProp = RouteProp<HistoryStackParamList, 'TableCupping'>;

export const TableCuppingScreen: React.FC = () => {
  const route = useRoute<TableCuppingRouteProp>();
  const { sessionId, coffeeId } = route.params;

  const [session, setSession] = useState<Session | null>(null);
  const [coffee, setCoffee] = useState<CoffeeEntry | null>(null);
  const [uniformity, setUniformity] = useState<UniformityScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Load session and uniformity data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const sessionData = await sessionService.getSession(sessionId);
        if (!sessionData) {
          setError('Session not found');
          return;
        }

        setSession(sessionData);

        const coffeeData = sessionData.coffees.find((c) => c.coffeeId === coffeeId);
        if (!coffeeData) {
          setError('Coffee not found in session');
          return;
        }

        setCoffee(coffeeData);

        // Get uniformity scores
        const uniformityScores = await analyticsService.getUniformityScores(sessionId);
        const coffeeUniformity = uniformityScores.find((u) => u.coffeeId === coffeeId);

        if (coffeeUniformity) {
          setUniformity(coffeeUniformity);
        }
      } catch (err) {
        const errorMessage = handleError(err, 'TableCuppingScreen.loadData');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sessionId, coffeeId, retryCount]);

  // Calculate average score for all cups
  const calculateAverageScore = useCallback((cups: Cup[]): number => {
    if (cups.length === 0) return 0;

    const totalScore = cups.reduce((sum, cup) => {
      return (
        sum +
        (cup.ratings.acidity || 0) +
        (cup.ratings.sweetness || 0) +
        (cup.ratings.body || 0) +
        (cup.ratings.clarity || 0) +
        (cup.ratings.finish || 0) +
        (cup.ratings.enjoyment || 0)
      );
    }, 0);

    return totalScore / cups.length;
  }, []);

  // Get uniformity rating text
  const getUniformityRating = (score: number): { text: string; color: string } => {
    if (score >= 95) return { text: 'Excellent', color: colors.success };
    if (score >= 85) return { text: 'Good', color: colors.primary };
    if (score >= 70) return { text: 'Fair', color: colors.warning };
    return { text: 'Inconsistent', color: colors.error };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner message="Loading table cupping data..." />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          title="Failed to Load Table Cupping Data"
          message={error}
          action={{
            title: 'Try Again',
            onPress: () => setRetryCount((prev) => prev + 1),
          }}
        />
      </SafeAreaView>
    );
  }

  if (!session || !coffee) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          title="Data Not Available"
          message="Unable to load table cupping data for this coffee."
        />
      </SafeAreaView>
    );
  }

  const averageScore = calculateAverageScore(coffee.cups);
  const uniformityRating = uniformity ? getUniformityRating(uniformity.uniformityScore) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Coffee Header */}
        <Card style={styles.headerCard}>
          <Text style={styles.coffeeName}>{coffee.name}</Text>
          {coffee.origin && (
            <Text style={styles.coffeeDetail}>Origin: {coffee.origin}</Text>
          )}
          {coffee.roaster && (
            <Text style={styles.coffeeDetail}>Roaster: {coffee.roaster}</Text>
          )}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Cups</Text>
              <Text style={styles.statValue}>{coffee.cups.length}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Avg Score</Text>
              <Text style={styles.statValue}>{averageScore.toFixed(1)}</Text>
            </View>
          </View>
        </Card>

        {/* Uniformity Analysis */}
        {uniformity && (
          <Card style={styles.uniformityCard}>
            <Text style={styles.sectionTitle}>Uniformity Analysis</Text>

            <View style={styles.uniformityHeader}>
              <View>
                <Text style={styles.uniformityScore}>
                  {uniformity.uniformityScore.toFixed(1)}
                </Text>
                <Text style={styles.uniformityLabel}>Uniformity Score</Text>
              </View>
              {uniformityRating && (
                <Badge
                  label={uniformityRating.text}
                  color={uniformityRating.color}
                  style={styles.uniformityBadge}
                />
              )}
            </View>

            <Divider spacing="medium" />

            <View style={styles.statsGrid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Standard Deviation</Text>
                <Text style={styles.gridValue}>{uniformity.standardDeviation.toFixed(2)}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Score Range</Text>
                <Text style={styles.gridValue}>
                  {Math.min(...uniformity.cupScores.map((c) => c.totalScore)).toFixed(1)} -{' '}
                  {Math.max(...uniformity.cupScores.map((c) => c.totalScore)).toFixed(1)}
                </Text>
              </View>
            </View>

            <Text style={styles.helperText}>
              {uniformity.uniformityScore >= 95 && 'Exceptional consistency across all cups.'}
              {uniformity.uniformityScore >= 85 &&
                uniformity.uniformityScore < 95 &&
                'Good uniformity with minimal variation.'}
              {uniformity.uniformityScore >= 70 &&
                uniformity.uniformityScore < 85 &&
                'Moderate variation detected between cups.'}
              {uniformity.uniformityScore < 70 && 'Significant inconsistencies between cups.'}
            </Text>
          </Card>
        )}

        {/* Cup Comparison Table */}
        <Card style={styles.tableCard}>
          <Text style={styles.sectionTitle}>Cup-by-Cup Analysis</Text>

          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.cupColumn]}>Cup</Text>
              <Text style={[styles.tableHeaderCell, styles.scoreColumn]}>Sweet</Text>
              <Text style={[styles.tableHeaderCell, styles.scoreColumn]}>Acid</Text>
              <Text style={[styles.tableHeaderCell, styles.scoreColumn]}>Body</Text>
              <Text style={[styles.tableHeaderCell, styles.scoreColumn]}>Clarity</Text>
              <Text style={[styles.tableHeaderCell, styles.scoreColumn]}>Finish</Text>
              <Text style={[styles.tableHeaderCell, styles.totalColumn]}>Total</Text>
            </View>

            {/* Table Rows */}
            {coffee.cups
              .sort((a, b) => a.position - b.position)
              .map((cup, index) => {
                const total =
                  (cup.ratings.acidity || 0) +
                  (cup.ratings.sweetness || 0) +
                  (cup.ratings.body || 0) +
                  (cup.ratings.clarity || 0) +
                  (cup.ratings.finish || 0) +
                  (cup.ratings.enjoyment || 0);

                const isHighest =
                  uniformity &&
                  total ===
                    Math.max(...uniformity.cupScores.map((c) => c.totalScore));
                const isLowest =
                  uniformity &&
                  total ===
                    Math.min(...uniformity.cupScores.map((c) => c.totalScore));

                return (
                  <View
                    key={cup.cupId}
                    style={[
                      styles.tableRow,
                      index % 2 === 0 && styles.tableRowEven,
                      isHighest && styles.tableRowHighest,
                      isLowest && styles.tableRowLowest,
                    ]}
                  >
                    <Text style={[styles.tableCell, styles.cupColumn]}>
                      #{cup.position}
                    </Text>
                    <Text style={[styles.tableCell, styles.scoreColumn]}>
                      {(cup.ratings.sweetness || 0).toFixed(1)}
                    </Text>
                    <Text style={[styles.tableCell, styles.scoreColumn]}>
                      {(cup.ratings.acidity || 0).toFixed(1)}
                    </Text>
                    <Text style={[styles.tableCell, styles.scoreColumn]}>
                      {(cup.ratings.body || 0).toFixed(1)}
                    </Text>
                    <Text style={[styles.tableCell, styles.scoreColumn]}>
                      {(cup.ratings.clarity || 0).toFixed(1)}
                    </Text>
                    <Text style={[styles.tableCell, styles.scoreColumn]}>
                      {(cup.ratings.finish || 0).toFixed(1)}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        styles.totalColumn,
                        styles.totalScore,
                      ]}
                    >
                      {total.toFixed(1)}
                    </Text>
                  </View>
                );
              })}

            {/* Average Row */}
            <View style={[styles.tableRow, styles.averageRow]}>
              <Text style={[styles.tableCell, styles.cupColumn, styles.averageLabel]}>
                Average
              </Text>
              <Text style={[styles.tableCell, styles.scoreColumn, styles.averageValue]}>
                {(
                  coffee.cups.reduce((sum, c) => sum + (c.ratings.sweetness || 0), 0) /
                  coffee.cups.length
                ).toFixed(1)}
              </Text>
              <Text style={[styles.tableCell, styles.scoreColumn, styles.averageValue]}>
                {(
                  coffee.cups.reduce((sum, c) => sum + (c.ratings.acidity || 0), 0) /
                  coffee.cups.length
                ).toFixed(1)}
              </Text>
              <Text style={[styles.tableCell, styles.scoreColumn, styles.averageValue]}>
                {(
                  coffee.cups.reduce((sum, c) => sum + (c.ratings.body || 0), 0) /
                  coffee.cups.length
                ).toFixed(1)}
              </Text>
              <Text style={[styles.tableCell, styles.scoreColumn, styles.averageValue]}>
                {(
                  coffee.cups.reduce((sum, c) => sum + (c.ratings.clarity || 0), 0) /
                  coffee.cups.length
                ).toFixed(1)}
              </Text>
              <Text style={[styles.tableCell, styles.scoreColumn, styles.averageValue]}>
                {(
                  coffee.cups.reduce((sum, c) => sum + (c.ratings.finish || 0), 0) /
                  coffee.cups.length
                ).toFixed(1)}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.totalColumn,
                  styles.averageValue,
                  styles.totalScore,
                ]}
              >
                {averageScore.toFixed(1)}
              </Text>
            </View>
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.success + '30' }]} />
              <Text style={styles.legendText}>Highest Score</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.warning + '30' }]} />
              <Text style={styles.legendText}>Lowest Score</Text>
            </View>
          </View>
        </Card>

        {/* Professional Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.sectionTitle}>Professional Cupping Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tip}>
              • High uniformity (&gt;90) indicates consistent processing and quality
            </Text>
            <Text style={styles.tip}>
              • Standard deviation &lt;1.0 is excellent for specialty coffee
            </Text>
            <Text style={styles.tip}>
              • Outlier cups may indicate processing inconsistencies or defects
            </Text>
            <Text style={styles.tip}>
              • Compare uniformity scores across different coffees to assess quality control
            </Text>
          </View>
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
  headerCard: {
    marginBottom: spacing.lg,
  },
  coffeeName: {
    ...typography.heading2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  coffeeDetail: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs / 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.xs / 2,
  },
  statValue: {
    ...typography.heading3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  uniformityCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  uniformityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  uniformityScore: {
    ...typography.heading1,
    color: colors.primary,
    fontWeight: 'bold',
  },
  uniformityLabel: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing.xs / 2,
  },
  uniformityBadge: {
    alignSelf: 'flex-start',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  gridItem: {
    flex: 1,
  },
  gridLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.xs / 2,
  },
  gridValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  helperText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  tableCard: {
    marginBottom: spacing.lg,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.xs,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  tableHeaderCell: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    padding: spacing.sm,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowEven: {
    backgroundColor: colors.surface + '40',
  },
  tableRowHighest: {
    backgroundColor: colors.success + '30',
  },
  tableRowLowest: {
    backgroundColor: colors.warning + '30',
  },
  averageRow: {
    backgroundColor: colors.primary + '20',
    borderBottomWidth: 0,
  },
  tableCell: {
    ...typography.bodySmall,
    color: colors.text.primary,
    padding: spacing.sm,
    textAlign: 'center',
  },
  cupColumn: {
    flex: 1,
    fontWeight: '600',
  },
  scoreColumn: {
    flex: 1,
  },
  totalColumn: {
    flex: 1.2,
  },
  totalScore: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  averageLabel: {
    fontWeight: 'bold',
  },
  averageValue: {
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  tipsCard: {
    marginBottom: spacing.lg,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tip: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
});
