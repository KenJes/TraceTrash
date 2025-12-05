import { AuthProvider, useAuthContext } from '@/components/auth-context';
import { ThemeProvider, useThemeContext } from '@/components/theme-context';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Slot, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: 'login',
};

function LayoutHelpers() {
  const { theme } = useThemeContext();
  const { isLoggedIn, user } = useAuthContext();
  const router = useRouter();

  // Registrar notificaciones push automáticamente
  usePushNotifications();

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (isLoggedIn) {
          if (user?.rol === 'admin') {
            router.replace('/(admin)/admin-index');
          } else if (user?.rol === 'conductor') {
            router.replace('/(tabs)/conductor-index');
          } else {
            router.replace('/(tabs)');
          }
        } else {
          router.replace('/login');
        }
      } catch (err) {
        console.warn('RootLayout navigation skipped (router not ready yet):', err);
      }
    }, 0);

    return () => clearTimeout(t);
  }, [isLoggedIn, user, router]);

  return (
    <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Slot />
        <LayoutHelpers />
      </AuthProvider>
    </ThemeProvider>
  );
}