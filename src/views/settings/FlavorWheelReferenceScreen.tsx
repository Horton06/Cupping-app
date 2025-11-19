/**
 * Flavor Wheel Reference Screen
 *
 * Read-only reference for exploring the SCA flavor wheel.
 * Features:
 * - Browse flavors by category
 * - Search functionality
 * - Flavor descriptions and related flavors
 * - Category color coding
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput as RNTextInput,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Card, Badge, Divider } from '../../components';
import { flavorService } from '../../services/flavorService';
import type { Flavor } from '../../types/flavor.types';
import { colors, spacing, typography } from '../../theme';

export const FlavorWheelReferenceScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<Flavor | null>(null);
  const [showFlavorDetail, setShowFlavorDetail] = useState(false);

  // Load categories
  const categories = useMemo(() => flavorService.getAllCategories(), []);

  // Search and filter flavors
  const filteredFlavors = useMemo(() => {
    let flavors: Flavor[];

    // Filter by category first
    if (selectedCategory) {
      flavors = flavorService.getFlavorsByCategory(selectedCategory);
    } else {
      flavors = flavorService.getAllFlavors();
    }

    // Then apply search query
    if (searchQuery.trim().length > 0) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      flavors = flavors.filter(
        (flavor) =>
          flavor.name.toLowerCase().includes(lowerQuery) ||
          flavor.description.toLowerCase().includes(lowerQuery)
      );
    }

    return flavors.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, selectedCategory]);

  // Handle flavor selection
  const handleFlavorPress = useCallback((flavor: Flavor) => {
    setSelectedFlavor(flavor);
    setShowFlavorDetail(true);
  }, []);

  // Handle category selection
  const handleCategoryPress = useCallback((categoryName: string) => {
    setSelectedCategory((prev) => (prev === categoryName ? null : categoryName));
  }, []);

  // Render category chips
  const renderCategoryChips = () => (
    <View style={styles.categoriesContainer}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.categoryChips}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.name}
            style={[
              styles.categoryChip,
              selectedCategory === category.name && styles.categoryChipActive,
              { borderColor: category.color },
            ]}
            onPress={() => handleCategoryPress(category.name)}
          >
            <View
              style={[styles.categoryColorDot, { backgroundColor: category.color }]}
            />
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category.name && styles.categoryChipTextActive,
              ]}
            >
              {category.displayName} ({category.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Render flavor item
  const renderFlavorItem = ({ item }: { item: Flavor }) => (
    <TouchableOpacity
      style={styles.flavorCard}
      onPress={() => handleFlavorPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.flavorCardContent}>
        <View style={[styles.flavorColorBar, { backgroundColor: item.color }]} />
        <View style={styles.flavorInfo}>
          <Text style={styles.flavorName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.flavorDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <Text style={styles.flavorCategory}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render flavor detail modal
  const renderFlavorDetailModal = () => {
    if (!selectedFlavor) return null;

    const relatedFlavors = flavorService.getRelatedFlavors(selectedFlavor.id);

    return (
      <Modal
        visible={showFlavorDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFlavorDetail(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Flavor Detail</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFlavorDetail(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Card style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <View
                  style={[
                    styles.detailColorDot,
                    { backgroundColor: selectedFlavor.color },
                  ]}
                />
                <Text style={styles.detailName}>{selectedFlavor.name}</Text>
              </View>

              <Badge
                label={selectedFlavor.category}
                variant="default"
                style={styles.detailCategoryBadge}
              />

              {selectedFlavor.description && (
                <>
                  <Divider spacing="medium" />
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Description</Text>
                    <Text style={styles.detailDescription}>
                      {selectedFlavor.description}
                    </Text>
                  </View>
                </>
              )}

              {relatedFlavors.length > 0 && (
                <>
                  <Divider spacing="medium" />
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      Related Flavors ({relatedFlavors.length})
                    </Text>
                    <View style={styles.relatedFlavorsContainer}>
                      {relatedFlavors.map((flavor) => (
                        <TouchableOpacity
                          key={flavor.id}
                          style={styles.relatedFlavorChip}
                          onPress={() => {
                            setSelectedFlavor(flavor);
                          }}
                        >
                          <View
                            style={[
                              styles.relatedFlavorDot,
                              { backgroundColor: flavor.color },
                            ]}
                          />
                          <Text style={styles.relatedFlavorText}>{flavor.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}

              <Divider spacing="medium" />

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Flavor ID</Text>
                <Text style={styles.detailMeta}>#{selectedFlavor.id}</Text>
              </View>
            </Card>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <RNTextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search flavors by name or description..."
          placeholderTextColor={colors.text.tertiary}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Category Chips */}
      {renderCategoryChips()}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredFlavors.length} flavor{filteredFlavors.length !== 1 ? 's' : ''}
          {selectedCategory && ' in category'}
        </Text>
        {selectedCategory && (
          <TouchableOpacity onPress={() => setSelectedCategory(null)}>
            <Text style={styles.clearFilterText}>Clear filter</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Flavor List */}
      {filteredFlavors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery || selectedCategory
              ? 'No flavors match your search'
              : 'No flavors available'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFlavors}
          renderItem={renderFlavorItem}
          keyExtractor={(item) => `flavor-${item.id}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Flavor Detail Modal */}
      {renderFlavorDetailModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: colors.primary + '15',
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryChipText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  resultsText: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  clearFilterText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  flavorCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  flavorCardContent: {
    flexDirection: 'row',
  },
  flavorColorBar: {
    width: 4,
  },
  flavorInfo: {
    flex: 1,
    padding: spacing.md,
  },
  flavorName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  flavorDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  flavorCategory: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.heading3,
    color: colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  closeButtonText: {
    ...typography.heading4,
    color: colors.text.secondary,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: spacing.lg,
  },
  detailCard: {
    padding: spacing.lg,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  detailColorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  detailName: {
    ...typography.heading2,
    color: colors.text.primary,
    flex: 1,
  },
  detailCategoryBadge: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  detailSection: {
    marginTop: spacing.md,
  },
  detailSectionTitle: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  detailDescription: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 24,
  },
  detailMeta: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  relatedFlavorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm / 2,
  },
  relatedFlavorChip: {
    flexDirection: 'row',
    marginHorizontal: spacing.sm / 2,
    marginBottom: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  relatedFlavorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  relatedFlavorText: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
});
