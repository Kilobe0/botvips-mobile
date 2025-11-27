import { theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View, Image } from 'react-native'; // <--- Importei Image
import { Button, Text, TextInput } from 'react-native-paper';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) return;
    console.log('[Login] Starting login process...');
    setLoading(true);
    try {
      console.log('[Login] Calling signIn...');
      await signIn(email, password);
      console.log('[Login] SignIn successful, navigating...');
      router.replace('/(tabs)');
      console.log('[Login] Navigation complete');
    } catch (error: any) {
      console.error('[Login] Error:', error);
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
      console.log('[Login] Login process finished');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* LOGO SUBSTITUINDO O TEXTO */}
      <Image 
        source={{ uri: 'https://www.botvips.app/images/logo-botvips.png' }}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text variant="bodyLarge" style={{ textAlign: 'center', marginBottom: 40, color: theme.colors.onSurfaceVariant }}>
        Gerencie suas vendas
      </Text>

      <TextInput
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        label="Senha"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        style={styles.button}
        contentStyle={{ height: 50 }}
      >
        ENTRAR
      </Button>
      <Button
        mode="text"
        onPress={() => router.push('/(auth)/register')}
        style={{ marginTop: 20 }}
      >
        Criar uma conta
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  logo: {
    width: '100%',
    height: 200,
    alignSelf: 'center',
    marginBottom: 10,
  },
  input: { marginBottom: 16 },
  button: { marginTop: 10, borderRadius: 8 },
});