import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

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
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtext: {
    color: '#888888',
    fontSize: 16,
  },
});
