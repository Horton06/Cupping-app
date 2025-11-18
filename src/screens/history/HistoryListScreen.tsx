/**
 * History List Screen
 *
 * Browse past tasting sessions with search, filters, and actions.
 * Features:
 * - Session cards with preview information
 * - Pull-to-refresh
 * - Search by coffee name
 * - Filter by session type and date range
 * - Delete and navigate to detail/edit
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput as RNTextInput,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { HistoryNavigationProp } from '../../navigation/types';
import { Card, Badge, ErrorState, LoadingSpinner } from '../../components';
import { sessionService } from '../../services/sessionService';
import type { Session, SessionType } from '../../types/session.types';
import { colors, spacing, typography } from '../../theme';
import { useDebounce } from '../../hooks/useDebounce';
import { handleError } from '../../utils/errorHandling';

type FilterType = SessionType | 'all';

export const HistoryListScreen: React.FC = () => {
  const navigation = useNavigation<HistoryNavigationProp>();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Load sessions
  const loadSessions = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const allSessions = await sessionService.getAllSessions({
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setSessions(allSessions);
      setFilteredSessions(allSessions);
    } catch (err) {
      const errorMessage = handleError(err, 'HistoryListScreen.loadSessions');
      setError(errorMessage);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSessions(false);
    }, [loadSessions])
  );

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSessions(false);
    setRefreshing(false);
  }, [loadSessions]);

  // Filter and search logic
  const applyFilters = useCallback(
    (query: string, type: FilterType) => {
      let filtered = sessions;

      // Filter by type
      if (type !== 'all') {
        filtered = filtered.filter((s) => s.sessionType === type);
      }

      // Filter by search query (coffee names)
      if (query.trim().length > 0) {
        const lowerQuery = query.toLowerCase();
        filtered = filtered.filter((s) =>
          s.coffees.some(
            (c) =>
              c.name.toLowerCase().includes(lowerQuery) ||
              c.roaster?.toLowerCase().includes(lowerQuery) ||
              c.origin?.toLowerCase().includes(lowerQuery)
          )
        );
      }

      setFilteredSessions(filtered);
    },
    [sessions]
  );

  // Debounced search
  const debouncedApplyFilters = useDebounce<(query: string, type: FilterType) => void>(
    applyFilters,
    300
  );

  // Handle search change
  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      debouncedApplyFilters(text, filterType);
    },
    [filterType, debouncedApplyFilters]
  );

  // Handle filter change
  const handleFilterChange = useCallback(
    (type: FilterType) => {
      setFilterType(type);
      applyFilters(searchQuery, type);
    },
    [searchQuery, applyFilters]
  );

  // Navigate to detail
  const handleViewSession = useCallback(
    (sessionId: string) => {
      navigation.navigate('HistoryDetail', { sessionId });
    },
    [navigation]
  );

  // Delete session
  const handleDeleteSession = useCallback(
    (session: Session) => {
      Alert.alert(
        'Delete Session',
        `Are you sure you want to delete this ${session.sessionType} session? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await sessionService.deleteSession(session.id);
                await loadSessions(false);
                Alert.alert('Success', 'Session deleted successfully.');
              } catch (error) {
                console.error('[HistoryList] Error deleting session:', error);
                Alert.alert('Error', 'Failed to delete session. Please try again.');
              }
            },
          },
        ]
      );
    },
    [loadSessions]
  );

  // Render session card
  const renderSessionCard = useCallback(
    ({ item }: { item: Session }) => {
      const firstCoffee = item.coffees[0];
      const coffeeCount = item.coffees.length;
      const date = new Date(item.createdAt);
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      // Calculate average scores if available
      let avgScore: number | null = null;
      const totalCups = item.coffees.reduce((sum, c) => sum + c.cups.length, 0);
      if (totalCups > 0) {
        const totalScore = item.coffees.reduce(
          (sum, c) =>
            sum +
            c.cups.reduce((cSum, cup) => {
              const scores = [
                cup.ratings.sweetness,
                cup.ratings.acidity,
                cup.ratings.body,
                cup.ratings.clarity,
                cup.ratings.finish,
              ];
              const validScores = scores.filter((s) => s !== undefined) as number[];
              const cupAvg =
                validScores.length > 0
                  ? validScores.reduce((a, b) => a + b, 0) / validScores.length
                  : 0;
              return cSum + cupAvg;
            }, 0),
          0
        );
        avgScore = totalScore / totalCups;
      }

      return (
        <Card
          style={styles.sessionCard}
          onPress={() => handleViewSession(item.id)}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.sessionType}>{item.sessionType}</Text>
              <Text style={styles.sessionDate}>{dateStr}</Text>
            </View>
            {avgScore !== null && (
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreValue}>{avgScore.toFixed(1)}</Text>
                <Text style={styles.scoreLabel}>avg</Text>
              </View>
            )}
          </View>

          <View style={styles.cardContent}>
            {firstCoffee && (
              <>
                <Text style={styles.coffeeName} numberOfLines={1}>
                  {firstCoffee.name}
                </Text>
                {firstCoffee.origin && (
                  <Text style={styles.coffeeDetail} numberOfLines={1}>
                    {firstCoffee.origin}
                    {firstCoffee.roaster ? ` • ${firstCoffee.roaster}` : ''}
                  </Text>
                )}
              </>
            )}

            {coffeeCount > 1 && (
              <Text style={styles.coffeeCount}>
                +{coffeeCount - 1} more coffee{coffeeCount > 2 ? 's' : ''}
              </Text>
            )}

            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.slice(0, 3).map((tag, idx) => (
                  <Badge key={idx} label={tag} variant="default" />
                ))}
                {item.tags.length > 3 && (
                  <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleViewSession(item.id)}
            >
              <Text style={styles.actionButtonText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteSession(item)}
            >
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      );
    },
    [handleViewSession, handleDeleteSession]
  );

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Sessions Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery || filterType !== 'all'
          ? 'Try adjusting your search or filters'
          : 'Start a new tasting session to see it here'}
      </Text>
    </View>
  );

  // Filter buttons
  const filterOptions: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Single', value: 'single-coffee' },
    { label: 'Multi', value: 'multi-coffee' },
    { label: 'Table', value: 'table-cupping' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          title="Failed to Load Sessions"
          message={error}
          action={{
            title: 'Try Again',
            onPress: () => loadSessions(),
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <RNTextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Search by coffee name, origin, or roaster..."
          placeholderTextColor={colors.text.tertiary}
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filtersContainer}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterChip,
              filterType === option.value && styles.filterChipActive,
            ]}
            onPress={() => handleFilterChange(option.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterType === option.value && styles.filterChipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Session Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Session List */}
      <FlatList
        data={filteredSessions}
        renderItem={renderSessionCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  searchContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchInput: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    padding: spacing.md,
    color: colors.text.primary,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.background,
  },
  countContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  countText: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  sessionCard: {
    marginBottom: spacing.lg,
    padding: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  sessionType: {
    ...typography.heading4,
    color: colors.text.primary,
    textTransform: 'capitalize',
    marginBottom: spacing.xs / 2,
  },
  sessionDate: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreValue: {
    ...typography.heading3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  scoreLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  cardContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  coffeeName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  coffeeDetail: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  coffeeCount: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xs / 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  moreTagsText: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    overflow: 'hidden',
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  actionButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: colors.error,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyTitle: {
    ...typography.heading3,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
