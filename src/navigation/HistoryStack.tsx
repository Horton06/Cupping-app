/**
 * History Stack Navigator
 *
 * Navigation for browsing past sessions.
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { HistoryStackParamList } from './types';
import { TEST_VALUE } from '../TEST_FILE';
import { HistoryListScreen } from '@/screens/history/HistoryListScreen';
import { TableCuppingScreen } from '@/screens/history/TableCuppingScreen';
import { SessionDetailScreen } from '@/screens/sessions/SessionDetailScreen';
import { ComparisonScreen } from '@/screens/comparison/ComparisonScreen';
import { colors, typography } from '../theme';

console.log('TEST_VALUE:', TEST_VALUE);

const Stack = createStackNavigator<HistoryStackParamList>();

export const HistoryStack: React.FC = () => {
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
        name="HistoryList"
        component={HistoryListScreen}
        options={{ title: 'History' }}
      />
      <Stack.Screen
        name="HistoryDetail"
        component={SessionDetailScreen}
        options={{ title: 'Session Details' }}
      />
      <Stack.Screen
        name="Comparison"
        component={ComparisonScreen}
        options={{ title: 'Compare Coffees' }}
      />
      <Stack.Screen
        name="TableCupping"
        component={TableCuppingScreen}
        options={{ title: 'Table Cupping' }}
      />
      <Stack.Screen
        name="HistoryStats"
        component={HistoryListScreen} // Placeholder
        options={{ title: 'Statistics' }}
      />
    </Stack.Navigator>
  );
};
