/**
 * Settings Stack Navigator
 *
 * Navigation for app settings.
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { SettingsStackParamList } from './types';
import {
  SettingsHomeScreen,
  DataManagementScreen,
  SettingsScreen,
  FlavorWheelReferenceScreen,
} from '../screens/settings/index';
import { colors, typography } from '../theme';

const Stack = createStackNavigator<SettingsStackParamList>();

export const SettingsStack: React.FC = () => {
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
        name="SettingsHome"
        component={SettingsHomeScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="About"
        component={SettingsScreen} // Placeholder - Phase 3
        options={{ title: 'About' }}
      />
      <Stack.Screen
        name="DataManagement"
        component={DataManagementScreen}
        options={{ title: 'Data Management' }}
      />
      <Stack.Screen
        name="FlavorWheelReference"
        component={FlavorWheelReferenceScreen}
        options={{ title: 'Flavor Wheel' }}
      />
    </Stack.Navigator>
  );
};
