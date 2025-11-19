/**
 * New Session Stack Navigator
 *
 * Multi-step flow for creating a new tasting session.
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { NewSessionStackParamList } from './types';
import { SessionTypeSelectScreen } from '@/views/new-session/SessionTypeSelectScreen';
import { CoffeeSetupScreen } from '@/views/new-session/CoffeeSetupScreen';
import { FlavorSelectionScreen } from '@/views/new-session/FlavorSelectionScreen';
import { StructureScoringScreen } from '@/views/new-session/StructureScoringScreen';
import { SessionSummaryScreen } from '@/views/new-session/SessionSummaryScreen';
import { colors, typography } from '../theme';

const Stack = createStackNavigator<NewSessionStackParamList>();

export const NewSessionStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          ...typography.heading3,
          color: colors.text.primary,
        },
        headerBackTitleVisible: false,
        cardStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="SessionTypeSelect"
        component={SessionTypeSelectScreen}
        options={{ title: 'New Session' }}
      />
      <Stack.Screen
        name="CoffeeSetup"
        component={CoffeeSetupScreen}
        options={{ title: 'Coffee Setup' }}
      />
      <Stack.Screen
        name="FlavorSelection"
        component={FlavorSelectionScreen}
        options={{ title: 'Select Flavors' }}
      />
      <Stack.Screen
        name="StructureScoring"
        component={StructureScoringScreen}
        options={{ title: 'Rate Structure' }}
      />
      <Stack.Screen
        name="SessionSummary"
        component={SessionSummaryScreen}
        options={{
          title: 'Summary',
          headerLeft: () => null, // Disable back button on summary
          gestureEnabled: false, // Disable swipe back
        }}
      />
    </Stack.Navigator>
  );
};
