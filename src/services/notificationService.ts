import Constants from 'expo-constants';
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

    // if (Device.isDevice) { // Comentado para permitir testes em emulador
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
      
      // console.log("Expo Push Token:", token);
    // } else {
    //   console.log('Use um dispositivo físico para notificações Push');
    // }

    return token;
  } catch (error) {
    console.error('Erro ao registrar notificações push:', error);
    return undefined; // Retorna undefined em caso de erro ou timeout
  }
}

// Função para enviar o token ao backend
export async function sendPushTokenToBackend(email: string, token: string) {
}

// Setup de listeners de notificação
export function setupNotificationListeners() {
  // console.log('[NotificationService] Setting up notification listeners...');

  // Listener para notificações recebidas em foreground
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    // console.log('[NotificationService] Notification received in foreground:', notification);
    // Aqui você pode fazer processamento adicional, como atualizar o estado da aplicação
  });

  // Listener para quando o usuário interage com a notificação
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    // console.log('[NotificationService] User interacted with notification:', response);
    
    // Aqui você pode navegar para telas específicas baseado no payload da notificação
    const data = response.notification.request.content.data;
    // console.log('[NotificationService] Notification data:', data);
    
    // Exemplo: se a notificação contém um tipo, podemos navegar para a tela apropriada
    // if (data.type === 'new_sale') {
    //   // Navegar para dashboard ou tela de vendas
    // }
  });

  // Retorna função de cleanup
  return () => {
    // console.log('[NotificationService] Cleaning up notification listeners...');
    notificationListener.remove();
    responseListener.remove();
  };
}