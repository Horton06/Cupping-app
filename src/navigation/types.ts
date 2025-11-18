/**
 * Navigation Types
 *
 * TypeScript type definitions for React Navigation.
 * Provides type-safe navigation and route params.
 */

import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { SessionType } from '../types/session.types';

/**
 * Root Stack (contains tab navigator)
 */
export type RootStackParamList = {
  MainTabs: undefined;
};

/**
 * Bottom Tab Navigator
 */
export type MainTabParamList = {
  SessionsTab: undefined;
  NewSessionTab: undefined;
  HistoryTab: undefined;
  SettingsTab: undefined;
};

/**
 * Sessions Stack (first tab)
 */
export type SessionsStackParamList = {
  SessionsList: undefined;
  SessionDetail: { sessionId: string };
  SessionEdit: { sessionId: string };
};

/**
 * New Session Stack (second tab)
 */
export type NewSessionStackParamList = {
  SessionTypeSelect: undefined;
  CoffeeSetup: { sessionType: SessionType };
  FlavorSelection: { sessionId: string; coffeeId: string; cupId: string };
  StructureScoring: { sessionId: string; coffeeId: string; cupId: string };
  SessionNotes: { sessionId: string };
  SessionSummary: { sessionId: string };
};

/**
 * History Stack (third tab)
 */
export type HistoryStackParamList = {
  HistoryList: undefined;
  HistoryDetail: { sessionId: string };
  Comparison: { sessionId: string; coffeeId1?: string; coffeeId2?: string };
  TableCupping: { sessionId: string; coffeeId: string };
  HistoryStats: undefined;
};

/**
 * Settings Stack (fourth tab)
 */
export type SettingsStackParamList = {
  SettingsHome: undefined;
  About: undefined;
  DataManagement: undefined;
  FlavorWheelReference: undefined;
};

/**
 * Navigation prop types for type-safe navigation
 */
export type SessionsScreenNavigationProp = StackNavigationProp<
  SessionsStackParamList,
  'SessionsList'
>;

export type SessionDetailNavigationProp = StackNavigationProp<
  SessionsStackParamList,
  'SessionDetail'
>;

export type NewSessionNavigationProp = StackNavigationProp<
  NewSessionStackParamList,
  'SessionTypeSelect'
>;

export type FlavorSelectionNavigationProp = StackNavigationProp<
  NewSessionStackParamList,
  'FlavorSelection'
>;

export type HistoryNavigationProp = StackNavigationProp<
  HistoryStackParamList,
  'HistoryList'
>;

export type SettingsNavigationProp = StackNavigationProp<
  SettingsStackParamList,
  'SettingsHome'
>;

/**
 * Route prop types for accessing route params
 */
export type SessionDetailRouteProp = RouteProp<SessionsStackParamList, 'SessionDetail'>;
export type CoffeeSetupRouteProp = RouteProp<NewSessionStackParamList, 'CoffeeSetup'>;
export type FlavorSelectionRouteProp = RouteProp<NewSessionStackParamList, 'FlavorSelection'>;
export type StructureScoringRouteProp = RouteProp<NewSessionStackParamList, 'StructureScoring'>;
export type SessionNotesRouteProp = RouteProp<NewSessionStackParamList, 'SessionNotes'>;
export type SessionSummaryRouteProp = RouteProp<NewSessionStackParamList, 'SessionSummary'>;
export type HistoryDetailRouteProp = RouteProp<HistoryStackParamList, 'HistoryDetail'>;
