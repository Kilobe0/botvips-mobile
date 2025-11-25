import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn('[API] EXPO_PUBLIC_API_URL não configurada, usando fallback:', API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para adicionar o Token automaticamente
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Função para registrar Push Token no backend
export const registerPushToken = async (email: string, pushToken: string) => {
  return api.post('/user/record/push-token', {
    usermail: email, // Backend espera "usermail", não "email"
    pushToken
  });
};

export default api;