import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography, spacing } from './src/theme';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Cupper App</Text>
      <Text style={styles.subtext}>Coffee Cupping & Tasting Tracker</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.heading1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtext: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
