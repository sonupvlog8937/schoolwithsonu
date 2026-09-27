import React from 'react';
import { Stack } from 'expo-router';

export default function HumanResourceLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[resource]" />
    </Stack>
  );
}
