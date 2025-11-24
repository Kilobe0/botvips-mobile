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

export default api;