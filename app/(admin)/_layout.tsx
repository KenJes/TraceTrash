import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminTabLayout() {
  const colorScheme = useColorScheme();

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
      <Tabs.Screen
        name="admin-index"
        options={{
          title: 'Panel',
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid" size={28} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="admin-reportes"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color }) => (
            <Ionicons name="document-text" size={28} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="admin-conductores"
        options={{
          title: 'Conductores',
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={28} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="admin-rutas"
        options={{
          title: 'Rutas',
          tabBarIcon: ({ color }) => (
            <Ionicons name="map" size={28} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="admin-metricas"
        options={{
          title: 'Métricas',
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart" size={28} color={color} />
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
