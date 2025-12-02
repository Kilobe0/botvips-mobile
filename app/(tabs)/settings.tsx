import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerForPushNotificationsAsync } from '../../src/services/notificationService';

export default function SettingsScreen() {
    const [pushToken, setPushToken] = useState<string | undefined>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPushToken();
    }, []);

    const loadPushToken = async () => {
        setLoading(true);
        try {
            const token = await registerForPushNotificationsAsync();
            setPushToken(token);
        } catch (error) {
            console.error('Error fetching push token:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (pushToken) {
            await Clipboard.setStringAsync(pushToken);
            Alert.alert('Sucesso', 'Token copiado para a área de transferência!');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Configurações</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Debug / Testes</Text>

                    <View style={styles.card}>
                        <Text style={styles.label}>Expo Push Token</Text>
                        <Text style={styles.tokenText}>
                            {loading ? 'Carregando...' : pushToken || 'Token não disponível'}
                        </Text>

                        <TouchableOpacity
                            style={[styles.button, !pushToken && styles.buttonDisabled]}
                            onPress={copyToClipboard}
                            disabled={!pushToken || loading}
                        >
                            <Ionicons name="copy-outline" size={20} color="#FFF" style={styles.icon} />
                            <Text style={styles.buttonText}>Copiar Token</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4A5568',
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    label: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 8,
        fontWeight: '500',
    },
    tokenText: {
        fontSize: 13,
        color: '#2D3748',
        fontFamily: 'monospace',
        backgroundColor: '#EDF2F7',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        lineHeight: 20,
    },
    button: {
        backgroundColor: '#4C51BF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    buttonDisabled: {
        backgroundColor: '#A0AEC0',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    icon: {
        marginRight: 8,
    },
});
