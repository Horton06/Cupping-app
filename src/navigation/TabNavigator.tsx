/**
 * Bottom Tab Navigator
 *
 * Main app navigation with 4 tabs.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { SessionsStack } from './SessionsStack';
import { NewSessionStack } from './NewSessionStack';
import { HistoryStack } from './HistoryStack';
import { SettingsStack } from './SettingsStack';
import { colors, typography, spacing } from '../theme';

// Simple text-based tab bar (icons can be added later with expo-vector-icons)
const TabBarIcon: React.FC<{ label: string; focused: boolean }> = ({ label: _label, focused: _focused }) => {
  return null; // We'll use labels only for now
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: spacing.xs,
          paddingBottom: spacing.sm,
          height: 60,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: {
          ...typography.bodySmall,
          fontSize: 11,
        },
      }}
    >
      <Tab.Screen
        name="SessionsTab"
        component={SessionsStack}
        options={{
          tabBarLabel: 'Sessions',
          tabBarIcon: ({ focused }) => <TabBarIcon label="S" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="NewSessionTab"
        component={NewSessionStack}
        options={{
          tabBarLabel: 'New',
          tabBarIcon: ({ focused }) => <TabBarIcon label="+" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStack}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ focused }) => <TabBarIcon label="H" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused }) => <TabBarIcon label="⚙" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};
