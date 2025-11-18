/**
 * History Stack Navigator
 *
 * Navigation for browsing past sessions.
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { HistoryStackParamList } from './types';
import { HistoryListScreen } from '../screens/history/HistoryListScreen';
import { SessionDetailScreen } from '../screens/sessions/SessionDetailScreen';
import { colors, typography } from '../theme';

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
        name="HistoryStats"
        component={HistoryListScreen} // Placeholder
        options={{ title: 'Statistics' }}
      />
    </Stack.Navigator>
  );
};
