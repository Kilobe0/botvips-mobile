import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.surface, // Fundo escuro
            borderTopColor: theme.colors.outline,
          },
          tabBarActiveTintColor: theme.colors.primary, // Verde Neon
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        }}>

        {/* Aba do Dashboard */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />,
          }}
        />

        {/* Aba de Configurações - Oculta temporariamente */}
        <Tabs.Screen
          name="settings"
          options={{
            href: null, // Oculta da tab bar
            title: 'Configurações',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cog" size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="fab-menu"
          options={{
            href: null,
            title: 'Menus',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cog" size={24} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}