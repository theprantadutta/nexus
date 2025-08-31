import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChatsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats</Text>
      <Text style={styles.subtitle}>Your conversations</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
});
