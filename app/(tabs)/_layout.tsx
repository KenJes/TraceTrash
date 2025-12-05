import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { useAuthContext } from '@/components/auth-context';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuthContext();
  const isConductor = user?.rol === 'conductor' || false;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        },
      }}
    >
      {/* Tab de inicio para residentes */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={28} color={color} />
          ),
          href: isConductor ? undefined : '/(tabs)',
        }}
      />
      
      {/* Tab de inicio para conductores */}
      <Tabs.Screen
        name="conductor-index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => (
            <Ionicons name="car" size={28} color={color} />
          ),
          href: isConductor ? '/(tabs)/conductor-index' : null,
        }}
      />
      
      <Tabs.Screen
        name="reportar"
        options={{
          title: 'Reportar Incidencia',
          tabBarIcon: ({ color }) => (
            <Ionicons name="warning" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reportes"
        options={{
          title: 'Mis Reportes',
          tabBarIcon: ({ color }) => (
            <Ionicons name='chatbubble' size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
