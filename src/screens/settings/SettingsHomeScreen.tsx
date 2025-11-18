/**
 * Settings Home Screen
 *
 * Main settings screen for guest mode.
 * Includes app preferences, data management, and about sections.
 * Account/authentication features marked as "Coming Soon" for Phase 3.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { SettingsNavigationProp } from '../../navigation/types';
import { Card, Divider } from '../../components';
import { colors, typography, spacing } from '../../theme';

export const SettingsHomeScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavigationProp>();

  // App preferences state (would come from a settings store in production)
  const [haptics, setHaptics] = React.useState(true);
  const [showSCAScores, setShowSCAScores] = React.useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* App Preferences */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.setting}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Text style={styles.settingDescription}>
                Vibrate on interactions
              </Text>
            </View>
            <Switch
              value={haptics}
              onValueChange={setHaptics}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={haptics ? colors.primary : colors.text.tertiary}
            />
          </View>

          <Divider spacing="small" />

          <View style={styles.setting}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Default to SCA Scores</Text>
              <Text style={styles.settingDescription}>
                Show 6-10 scale instead of 1-5
              </Text>
            </View>
            <Switch
              value={showSCAScores}
              onValueChange={setShowSCAScores}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={showSCAScores ? colors.primary : colors.text.tertiary}
            />
          </View>
        </Card>

        {/* Reference */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Reference</Text>

          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => navigation.navigate('FlavorWheelReference')}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Flavor Wheel</Text>
              <Text style={styles.settingDescription}>
                Browse the SCA flavor wheel
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Data Management */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>

          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => navigation.navigate('DataManagement')}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Export & Backup</Text>
              <Text style={styles.settingDescription}>
                Export sessions as JSON
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Account Section - Coming Soon */}
        <Card style={[styles.section, styles.comingSoonSection]}>
          <View style={styles.comingSoonHeader}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonBadgeText}>Phase 3</Text>
            </View>
          </View>

          <View style={styles.comingSoonContent}>
            <Text style={styles.settingLabel}>Create an Account</Text>
            <Text style={styles.comingSoonDescription}>
              Sync your tastings across devices and share with the coffee
              community. Authentication and cloud sync coming in Phase 3 -
              Community Mode.
            </Text>
          </View>

          <View style={styles.comingSoonFeatures}>
            <Text style={styles.featureItem}>☁️ Cloud sync</Text>
            <Text style={styles.featureItem}>📱 Multi-device access</Text>
            <Text style={styles.featureItem}>👥 Share with community</Text>
            <Text style={styles.featureItem}>📊 Compare with others</Text>
          </View>
        </Card>

        {/* About */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>

          <Divider spacing="small" />

          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => {
              // TODO: Navigate to privacy policy
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <Divider spacing="small" />

          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => {
              // TODO: Navigate to terms of service
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.settingLabel}>Terms of Service</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <Divider spacing="small" />

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Made with ☕ & ❤️</Text>
          </View>
        </Card>
      </ScrollView>
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
  title: {
    ...typography.heading1,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  settingDescription: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing.xs / 2,
  },
  settingValue: {
    ...typography.body,
    color: colors.text.secondary,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  chevron: {
    ...typography.heading3,
    color: colors.text.tertiary,
  },
  comingSoonSection: {
    borderWidth: 2,
    borderColor: colors.primary + '40',
    backgroundColor: colors.primary + '08',
  },
  comingSoonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  comingSoonBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: spacing.sm,
  },
  comingSoonBadgeText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '600',
  },
  comingSoonContent: {
    marginBottom: spacing.md,
  },
  comingSoonDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    lineHeight: 24,
  },
  comingSoonFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  featureItem: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.sm,
  },
});
