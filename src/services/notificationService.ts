import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Função auxiliar para adicionar timeout a promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout excedido')), timeoutMs)
    ),
  ]);
}

export async function registerForPushNotificationsAsync() {
  try {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      // Adiciona timeout de 5 segundos para não travar em emuladores
      const { status: existingStatus } = await withTimeout(
        Notifications.getPermissionsAsync(),
        5000
      );
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await withTimeout(
          Notifications.requestPermissionsAsync(),
          5000
        );
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Falha ao obter permissão de push!');
        return;
      }

      const tokenData = await withTimeout(
        Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        }),
        5000
      );
      token = tokenData.data;
      
      console.log("Expo Push Token:", token);
    } else {
      console.log('Use um dispositivo físico para notificações Push');
    }

    return token;
  } catch (error) {
    console.error('Erro ao registrar notificações push:', error);
    return undefined; // Retorna undefined em caso de erro ou timeout
  }
}