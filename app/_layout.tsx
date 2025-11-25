import { theme } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { setupNotificationListeners } from '@/services/notificationService';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';

// Componente interno para controlar o redirecionamento
function RootNavigation() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // console.log('[Navigation Debug]', {
    //   user: !!user,
    //   loading,
    //   segments,
    //   inAuthGroup
    // });

    if (!user && !inAuthGroup) {
      // Se não tá logado e não tá na área de auth, manda pro login
      // console.log('[Navigation] Redirecting to login...');
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Se tá logado e tenta ir pro login, manda pro dashboard
      // console.log('[Navigation] Redirecting to tabs...');
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const cleanup = setupNotificationListeners();
    return cleanup;
  }, []);

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
    </PaperProvider>
  );
}