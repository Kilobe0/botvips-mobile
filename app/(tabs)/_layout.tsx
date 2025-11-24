import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const theme = useTheme();

  return (
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

      {/* Segunda aba (Ex: Configurações ou Histórico) */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar', // Mude para o que fizer sentido depois
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="compass" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}