import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { FAB, Portal } from 'react-native-paper';

export default function FabMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Portal>
      <FAB.Group
        open={open}
        icon={open ? 'close' : 'menu'}
        visible
        fabStyle={styles.fabStyle}
        actions={[
          { icon: 'robot-excited-outline', label: 'Criar Bot', onPress: () => router.push('/criar-bot') },
          { icon: 'robot-outline', label: 'Editar Bot', onPress: () => router.push('/editar-bot') },
          { icon: 'account-circle', label: 'Minha Conta', onPress: () => router.push('/minha-conta') },
          { icon: 'account-group', label: 'Afiliado', onPress: () => router.push('/afiliado') },
        ]}
        onStateChange={({ open }) => setOpen(open)}
        style={{
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 65 : 70,
          right: 20,
        }}
      />
    </Portal>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 65 : 70,
    right: 20,
    left: 0,        // garante que ocupe toda a largura
    top: 0,         // garante que ocupe toda a altura
    zIndex: 9999,
  },
  fabStyle: {
    backgroundColor: '#00E676',
  },
});
