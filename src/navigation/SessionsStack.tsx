/**
 * Sessions Stack Navigator
 *
 * Navigation for active sessions tab.
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { SessionsStackParamList } from './types';
import { SessionsListScreen } from '@/views/sessions/SessionsListScreen';
import { SessionDetailScreen } from '@/views/sessions/SessionDetailScreen';
import { colors, typography } from '../theme';

const Stack = createStackNavigator<SessionsStackParamList>();

export const SessionsStack: React.FC = () => {
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
        name="SessionsList"
        component={SessionsListScreen}
        options={{ title: 'Sessions' }}
      />
      <Stack.Screen
        name="SessionDetail"
        component={SessionDetailScreen}
        options={{ title: 'Session Details' }}
      />
      <Stack.Screen
        name="SessionEdit"
        component={SessionDetailScreen} // Placeholder
        options={{ title: 'Edit Session' }}
      />
    </Stack.Navigator>
  );
};
