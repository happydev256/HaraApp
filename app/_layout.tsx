import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: '#020403' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
      headerShown: false, // Default to false to keep it clean
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="pickup" options={{ title: 'Select Duration', headerShown: true }} />
      {/* These two lines fix the folder navigation and hide the "sessions/meditation" text */}
      <Stack.Screen name="sessions/breathing" options={{ headerShown: false }} />
      <Stack.Screen name="sessions/meditation" options={{ headerShown: false }} />
      <Stack.Screen name="success" options={{ headerShown: false }} />
      <Stack.Screen name="journey" options={{ title: 'Your Journey', headerShown: true }} />
    </Stack>
  );
}