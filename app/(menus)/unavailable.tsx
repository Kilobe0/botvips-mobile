import { useRouter } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

export default function UnavailableScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🚫</Text>

      <Text style={styles.title}>Função Indisponível</Text>
      <Text style={styles.subtitle}>
        Esta função não está disponível no app. 
        Para configurá-la, acesse a plataforma web.
      </Text>

      <Button 
        mode="contained" 
        style={styles.webButton}
        onPress={() => Linking.openURL("https://admin.botvips.app")}
      >
        Acessar página web
      </Button>

      <Button 
        mode="outlined" 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        Voltar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F5F5',
  },
  icon: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  webButton: {
    width: '80%',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#00E676',
    marginBottom: 12,
  },
  backButton: {
    width: '80%',
    paddingVertical: 8,
    borderRadius: 8,
    borderColor: '#00E676',
  },
});
