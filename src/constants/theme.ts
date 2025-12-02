import { MD3DarkTheme } from 'react-native-paper';

// Suas cores personalizadas
const customColors = {
  primary: '#00E676',       // Brand Green
  onPrimary: '#000000',     // Texto dentro do botão verde
  primaryContainer: '#003b1f', // Fundo suave de verde
  background: '#121212',    // Fundo App
  surface: '#1A1A1A',       // Fundo Cards
  surfaceVariant: '#252525',// Inputs background
  onSurface: '#FFFFFF',     // Texto principal
  onSurfaceVariant: '#9CA3AF', // Texto secundário (cinza)
  error: '#CF6679',
};

export const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...customColors,
    // Forçar o background para não usar o roxo padrão do Material 3
    background: customColors.background, 
    surface: customColors.surface,
  },
};

// Adicionando exports para compatibilidade com o template do Expo
export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#00E676',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#00E676',
  },
  dark: {
    text: '#ECEDEE',
    background: '#121212',
    tint: '#00E676',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#00E676',
  },
};

export const Fonts = {
  rounded: 'System',
  mono: 'System',
};