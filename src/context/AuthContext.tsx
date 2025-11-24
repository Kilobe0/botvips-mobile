import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { User } from '../types/api';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      console.log('[AuthContext] Loading stored data...');
      const storedUser = await SecureStore.getItemAsync('user_data');
      const storedToken = await SecureStore.getItemAsync('user_token');

      if (storedUser && storedToken) {
        console.log('[AuthContext] Found stored user session');
        setUser(JSON.parse(storedUser));
      } else {
        console.log('[AuthContext] No stored session found');
      }
      setLoading(false);
      console.log('[AuthContext] Loading complete');
    }
    loadStorageData();
  }, []);

  async function signIn(email: string, password: string) {
    try {
      console.log('[AuthContext] Starting signIn API call...');
      // ATENÇÃO: Endpoint conforme sua documentação (singin com 'g')
      const response = await api.post('/user/singin', { email, password });

      console.log('[AuthContext] API call successful');
      const userData = response.data;

      // Salva sessão
      await SecureStore.setItemAsync('user_token', userData.token);
      await SecureStore.setItemAsync('user_data', JSON.stringify(userData));

      console.log('[AuthContext] Session saved, updating user state');
      setUser(userData);
      console.log('[AuthContext] User state updated');

      // Registrar Push Notification após login com sucesso (não bloqueante)
      // Executa em background para não travar a tela de login
      console.log('[AuthContext] Starting push notification registration (non-blocking)...');

    } catch (error) {
      console.error('[AuthContext] SignIn error:', error);
      throw new Error('Falha no login. Verifique suas credenciais.');
    }
  }

  async function signOut() {
    await SecureStore.deleteItemAsync('user_token');
    await SecureStore.deleteItemAsync('user_data');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);