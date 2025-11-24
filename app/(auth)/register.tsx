import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const theme = useTheme();

  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      return Alert.alert('Erro', 'Preencha todos os campos');
    }

    setLoading(true);
    try {
      // Chama a API
      await signUp(name, email, password);
      
      Alert.alert('Sucesso', 'Conta criada! Faça login para continuar.', [
        { text: 'OK', onPress: () => router.back() } // Volta pro Login
      ]);
    } catch (error: any) {
      // O backend retorna o erro no response.data
      const msg = error.response?.data || 'Erro ao criar conta';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={{ color: theme.colors.primary, textAlign: 'center', marginBottom: 20 }}>
        Criar Conta
      </Text>

      <TextInput
        label="Nome Completo"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />

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
        onPress={handleRegister} 
        loading={loading} 
        style={styles.button}
      >
        CADASTRAR
      </Button>

      <Button 
        mode="text" 
        onPress={() => router.back()} 
        style={{ marginTop: 20 }}
      >
        Já tenho conta
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { marginBottom: 12 },
  button: { marginTop: 10, borderRadius: 8, paddingVertical: 6 },
});