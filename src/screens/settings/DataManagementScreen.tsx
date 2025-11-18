/**
 * Data Management Screen
 *
 * Allows users to export sessions as JSON and clear all data.
 * Export functionality requires expo-file-system and expo-sharing packages.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Button, Card } from '../../components';
import { sessionService } from '../../services/sessionService';
import { getDatabase } from '../../services/database/connection';
import { colors, typography, spacing } from '../../theme';
import { handleError } from '../../utils/errorHandling';

export const DataManagementScreen: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [sessionCount, setSessionCount] = useState<number | null>(null);

  // Load session count on mount
  React.useEffect(() => {
    loadSessionCount();
  }, []);

  const loadSessionCount = async () => {
    try {
      const sessions = await sessionService.getAllSessions();
      setSessionCount(sessions.length);
    } catch (error) {
      console.error('[DataManagement] Error loading session count:', error);
    }
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      // Get all sessions
      const sessions = await sessionService.getAllSessions();

      if (sessions.length === 0) {
        Alert.alert('No Data', 'You have no sessions to export.');
        setExporting(false);
        return;
      }

      // Prepare export data
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        totalSessions: sessions.length,
        sessions,
      };

      const json = JSON.stringify(exportData, null, 2);

      // In a full implementation with expo-file-system and expo-sharing:
      // const fileUri = FileSystem.documentDirectory + `cupper-export-${Date.now()}.json`;
      // await FileSystem.writeAsStringAsync(fileUri, json);
      // await Sharing.shareAsync(fileUri, {
      //   mimeType: 'application/json',
      //   dialogTitle: 'Export Cupper Data',
      // });

      // For now, show success with data size
      const sizeInKB = Math.round(json.length / 1024);
      Alert.alert(
        'Export Ready',
        `Prepared ${sessions.length} session${sessions.length !== 1 ? 's' : ''} for export (${sizeInKB} KB).\n\n` +
          'Note: Full export functionality requires expo-file-system and expo-sharing packages. ' +
          'This would normally save the JSON file and open the share dialog.',
        [{ text: 'OK' }]
      );

      console.log('[DataManagement] Export data prepared:', {
        sessionCount: sessions.length,
        sizeKB: sizeInKB,
      });
    } catch (err) {
      const errorMessage = handleError(err, 'DataManagementScreen.handleExport');
      Alert.alert('Export Failed', errorMessage);
    } finally {
      setExporting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      `This will permanently delete all ${sessionCount || 0} session${
        sessionCount !== 1 ? 's' : ''
      } from this device. This action cannot be undone.\n\nConsider exporting your data first.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await getDatabase();

              // Delete all data
              await db.transactionAsync(async (tx) => {
                await tx.executeSqlAsync('DELETE FROM selected_flavors');
                await tx.executeSqlAsync('DELETE FROM cups');
                await tx.executeSqlAsync('DELETE FROM coffees');
                await tx.executeSqlAsync('DELETE FROM sessions');
              }, false);

              Alert.alert('Success', 'All data has been cleared.', [
                {
                  text: 'OK',
                  onPress: () => {
                    setSessionCount(0);
                  },
                },
              ]);

              console.log('[DataManagement] All data cleared successfully');
            } catch (err) {
              const errorMessage = handleError(err, 'DataManagementScreen.handleClearData');
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Data Management</Text>

        {/* Session Count */}
        {sessionCount !== null && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Total Sessions</Text>
            <Text style={styles.infoValue}>{sessionCount}</Text>
          </View>
        )}

        {/* Export Data */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Export Data</Text>
          <Text style={styles.description}>
            Export all your tasting sessions to a JSON file for backup or
            transfer to another device.
          </Text>

          <View style={styles.featureList}>
            <Text style={styles.featureItem}>✓ All session data</Text>
            <Text style={styles.featureItem}>✓ Coffee metadata</Text>
            <Text style={styles.featureItem}>✓ Flavor selections</Text>
            <Text style={styles.featureItem}>✓ Structural scores</Text>
            <Text style={styles.featureItem}>✓ Notes and tags</Text>
          </View>

          <Button
            title={exporting ? 'Preparing Export...' : 'Export Sessions'}
            onPress={handleExport}
            loading={exporting}
            disabled={sessionCount === 0}
            fullWidth
          />

          {sessionCount === 0 && (
            <Text style={styles.disabledHint}>
              No sessions available to export
            </Text>
          )}
        </Card>

        {/* Import Data (Future) */}
        <Card style={[styles.section, styles.comingSoonSection]}>
          <View style={styles.comingSoonHeader}>
            <Text style={styles.sectionTitle}>Import Data</Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonBadgeText}>Coming Soon</Text>
            </View>
          </View>
          <Text style={styles.description}>
            Import sessions from a previously exported JSON file. This feature
            will be available in a future update.
          </Text>
        </Card>

        {/* Clear Data */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Clear All Data</Text>
          <Text style={[styles.description, styles.warningText]}>
            ⚠️ Warning: This will permanently delete all your tasting sessions
            from this device. This action cannot be undone.
          </Text>

          <Text style={styles.recommendation}>
            We recommend exporting your data first as a backup.
          </Text>

          <Button
            title="Clear All Data"
            onPress={handleClearData}
            variant="secondary"
            disabled={sessionCount === 0}
            fullWidth
          />

          {sessionCount === 0 && (
            <Text style={styles.disabledHint}>No data to clear</Text>
          )}
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
    ...typography.heading2,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  infoLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...typography.heading1,
    color: colors.primary,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  featureList: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  featureItem: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  warningText: {
    color: colors.error,
  },
  recommendation: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  disabledHint: {
    ...typography.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  comingSoonSection: {
    opacity: 0.6,
  },
  comingSoonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  comingSoonBadge: {
    backgroundColor: colors.text.tertiary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.xs,
  },
  comingSoonBadgeText: {
    ...typography.caption,
    color: colors.background,
    fontSize: 10,
    fontWeight: '600',
  },
});
