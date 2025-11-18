/**
 * Coffee Setup Screen
 *
 * Configure coffee details for the tasting session.
 * Supports single-coffee, multi-coffee, and table-cupping modes.
 */

import React, { useState, useCallback } from 'react';
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
  CoffeeSetupRouteProp,
  NewSessionNavigationProp,
} from '../../navigation/types';
import type { CoffeeFormData, SessionType } from '../../types/session.types';
import { CoffeeMetadataForm, Button, LoadingSpinner } from '../../components';
import { sessionService } from '../../services/sessionService';
import { colors, typography, spacing } from '../../theme';

export const CoffeeSetupScreen: React.FC = () => {
  const route = useRoute<CoffeeSetupRouteProp>();
  const navigation = useNavigation<NewSessionNavigationProp>();
  const { sessionType } = route.params;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [coffeeFormData, setCoffeeFormData] = useState<CoffeeFormData>({
    name: '',
  });
  const [coffees, setCoffees] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize session on first coffee add
  const initializeSession = useCallback(async (): Promise<string> => {
    if (sessionId) return sessionId;

    setIsLoading(true);
    try {
      const session = await sessionService.createSession(sessionType);
      setSessionId(session.id);
      return session.id;
    } catch (error) {
      console.error('[CoffeeSetup] Error creating session:', error);
      Alert.alert('Error', 'Failed to create session. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, sessionType]);

  // Continue to flavor selection
  const handleContinue = useCallback(
    (sid: string, coffeeId: string, cupId: string) => {
      navigation.navigate('FlavorSelection', {
        sessionId: sid,
        coffeeId,
        cupId,
      });
    },
    [navigation]
  );

  // Add coffee to session
  const handleAddCoffee = useCallback(async () => {
    // Validate coffee name is present
    if (!coffeeFormData.name || coffeeFormData.name.trim().length === 0) {
      Alert.alert('Required Field', 'Please enter a coffee name.');
      return;
    }

    setIsSaving(true);
    try {
      // Initialize session if needed
      const currentSessionId = await initializeSession();

      // Add coffee to database
      const coffee = await sessionService.addCoffeeToSession(
        currentSessionId,
        coffeeFormData
      );

      // Add to local list
      setCoffees(prev => [...prev, { id: coffee.coffeeId, name: coffee.name }]);

      // Reset form for next coffee
      setCoffeeFormData({ name: '' });

      // For single-coffee and table-cupping, automatically proceed
      if (sessionType !== 'multi-coffee') {
        handleContinue(currentSessionId, coffee.coffeeId, coffee.cups[0].cupId);
      }
    } catch (error) {
      console.error('[CoffeeSetup] Error adding coffee:', error);
      Alert.alert('Error', 'Failed to add coffee. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [coffeeFormData, initializeSession, sessionType, handleContinue]);

  // Continue with multiple coffees (multi-coffee mode)
  const handleContinueMulti = useCallback(async () => {
    if (coffees.length === 0) {
      Alert.alert('No Coffees', 'Please add at least one coffee to continue.');
      return;
    }

    if (!sessionId) return;

    try {
      // Fetch the session to get the first coffee's cup ID
      const session = await sessionService.getSession(sessionId);
      if (session && session.coffees.length > 0) {
        const firstCoffee = session.coffees[0];
        const firstCup = firstCoffee.cups[0];

        navigation.navigate('FlavorSelection', {
          sessionId,
          coffeeId: firstCoffee.coffeeId,
          cupId: firstCup.cupId,
        });
      }
    } catch (error) {
      console.error('[CoffeeSetup] Error fetching session:', error);
      Alert.alert('Error', 'Failed to proceed. Please try again.');
    }
  }, [coffees, sessionId, navigation]);

  const getInstructions = (type: SessionType): string => {
    switch (type) {
      case 'single-coffee':
        return 'Add details for the coffee you want to taste';
      case 'multi-coffee':
        return 'Add multiple coffees to compare side-by-side';
      case 'table-cupping':
        return 'Add coffee details for professional table cupping (5 cups)';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Creating session..." fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Coffee Setup</Text>
          <Text style={styles.subtitle}>{getInstructions(sessionType)}</Text>
        </View>

        {/* Added Coffees List (for multi-coffee) */}
        {sessionType === 'multi-coffee' && coffees.length > 0 && (
          <View style={styles.coffeesList}>
            <Text style={styles.coffeesListTitle}>
              Added Coffees ({coffees.length})
            </Text>
            {coffees.map((coffee, index) => (
              <View key={coffee.id} style={styles.coffeeItem}>
                <Text style={styles.coffeeItemText}>
                  {index + 1}. {coffee.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Coffee Metadata Form */}
        <CoffeeMetadataForm
          initialValues={coffeeFormData}
          onChange={setCoffeeFormData}
          disabled={isSaving}
        />
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        {sessionType === 'multi-coffee' ? (
          <>
            <Button
              title="Add Coffee"
              onPress={handleAddCoffee}
              loading={isSaving}
              variant="secondary"
              style={styles.addButton}
            />
            <Button
              title="Continue"
              onPress={handleContinueMulti}
              disabled={coffees.length === 0}
              style={styles.continueButton}
            />
          </>
        ) : (
          <Button
            title="Continue"
            onPress={handleAddCoffee}
            loading={isSaving}
            fullWidth
          />
        )}
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
  coffeesList: {
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.md,
  },
  coffeesListTitle: {
    ...typography.heading4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  coffeeItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  coffeeItemText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  addButton: {
    flex: 1,
  },
  continueButton: {
    flex: 1,
  },
});
