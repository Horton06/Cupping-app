/**
 * Flavor Selection Screen
 *
 * Interactive flavor wheel for selecting coffee flavor notes.
 * Features 132 flavors in concentric circles with pan/zoom gestures.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { FlavorSelectionRouteProp, NewSessionNavigationProp } from '../../navigation/types';
import { FlavorWheel, FlavorDetailPanel, useFlavorWheel } from '../../components/flavor-wheel';
import { Button } from '../../components';
import { sessionService } from '../../services/sessionService';
import { colors, spacing } from '../../theme';

export const FlavorSelectionScreen: React.FC = () => {
  const route = useRoute<FlavorSelectionRouteProp>();
  const navigation = useNavigation<NewSessionNavigationProp>();
  const { sessionId, coffeeId: _coffeeId, cupId } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    selectedFlavors,
    flavorMap,
    updateIntensity,
    removeFlavor,
    toggleDominant,
    resetViewport,
  } = useFlavorWheel({
    maxSelections: 10,
  });

  // Load existing flavors for this cup
  useEffect(() => {
    const loadFlavors = async () => {
      try {
        setIsLoading(true);
        await sessionService.getSession(sessionId);
        // TODO: Load cup flavors from session and set as initial selection
        // For now, just mark as loaded
      } catch (error) {
        console.error('[FlavorSelection] Error loading flavors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFlavors();
  }, [sessionId, cupId]);

  // Save flavors and continue
  const handleContinue = useCallback(async () => {
    try {
      setIsSaving(true);
      // Save flavors to cup
      await sessionService.updateCupFlavors(cupId, selectedFlavors);

      // Navigate to structure scoring
      navigation.navigate('StructureScoring', { sessionId, coffeeId: _coffeeId, cupId });
    } catch (error) {
      console.error('[FlavorSelection] Error saving flavors:', error);
    } finally {
      setIsSaving(false);
    }
  }, [cupId, selectedFlavors, navigation, sessionId, _coffeeId]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          {/* LoadingSpinner would go here */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Flavor Wheel */}
        <View style={styles.wheelContainer}>
          <FlavorWheel
            selectedFlavors={selectedFlavors}
            maxSelections={10}
          />
        </View>

        {/* Detail Panel */}
        <View style={styles.panelContainer}>
          <FlavorDetailPanel
            selectedFlavors={selectedFlavors}
            flavorMap={flavorMap}
            onUpdateIntensity={updateIntensity}
            onRemoveFlavor={removeFlavor}
            onToggleDominant={toggleDominant}
            maxSelections={10}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Reset View"
            onPress={resetViewport}
            variant="ghost"
            size="small"
            style={styles.resetButton}
          />
          <Button
            title="Continue"
            onPress={handleContinue}
            loading={isSaving}
            disabled={selectedFlavors.length === 0}
            style={styles.continueButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  resetButton: {
    flex: 1,
    marginRight: spacing.md,
  },
  continueButton: {
    flex: 2,
  },
});
