import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, Platform, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { ActivityIndicator, Avatar, Divider, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Importe seus serviços e tipos
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { DashboardResult } from '@/types/api';

// Helper local para formatar moeda (Cents -> Currency)
const formatMoney = (cents: number, currency: string = 'BRL') => {
  const locale = currency === 'BRL' ? 'pt-BR' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(cents / 100);
};

export default function DashboardScreen() {
  const theme = useTheme();
  const { signOut, user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardResult | null>(null);
  const [currentPeriodData, setCurrentPeriodData] = useState<{ today: number; month: number; currency: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para o filtro de data
  const [initDate, setInitDate] = useState(startOfMonth(new Date()));
  const [finishDate, setFinishDate] = useState(endOfMonth(new Date()));
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'init' | 'finish'>('init');

  const screenWidth = Dimensions.get('window').width;

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  // Função que busca os dados do mês atual (independente do filtro)
  const loadCurrentMonthData = useCallback(async () => {
    try {
      const now = new Date();
      const payload = {
        botId: null,
        initDate: startOfMonth(now).toISOString(),
        finishDate: endOfMonth(now).toISOString()
      };

      const response = await api.post('/user/dashboard', payload);
      setCurrentPeriodData({
        today: response.data.generalDashboard.billingToday,
        month: response.data.generalDashboard.billingMonth,
        currency: response.data.generalDashboard.currency
      });
    } catch (error) {
      console.error("Erro ao carregar dados do mês atual:", error);
    }
  }, []);

  // Função que busca os dados na API (baseado no filtro)
  const loadDashboard = useCallback(async () => {
    try {
      const payload = {
        botId: null, // null pega todos os bots do usuário
        initDate: initDate.toISOString(),
        finishDate: finishDate.toISOString()
      };

      const response = await api.post('/user/dashboard', payload);
      setData(response.data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [initDate, finishDate]);

  // Carrega dados do mês atual apenas uma vez ao montar o componente
  useEffect(() => {
    loadCurrentMonthData();
  }, [loadCurrentMonthData]);

  // Carrega ao abrir a tela e quando as datas mudam
  useEffect(() => {
    setLoading(true);
    loadDashboard();
  }, [loadDashboard]);

  // Função para o "Puxar para atualizar"
  const onRefresh = () => {
    setRefreshing(true);
    loadCurrentMonthData(); // Atualiza também o mês atual no refresh
    loadDashboard();
  };

  // Handlers para o DatePicker
  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate) {
      if (pickerMode === 'init') {
        setInitDate(selectedDate);
        // Se a data final for menor que a inicial, ajusta a final
        if (finishDate < selectedDate) {
          setFinishDate(endOfMonth(selectedDate));
        }
      } else {
        setFinishDate(selectedDate);
      }
    }
  };

  const showDatePicker = (mode: 'init' | 'finish') => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  // Loading State
  if (loading && !refreshing && !data) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 20, color: theme.colors.onSurfaceVariant }}>Carregando métricas...</Text>
      </View>
    );
  }

  // Se não carregar nada (erro ou vazio)
  if (!data && !loading) return null;

  const gd = data?.generalDashboard;

  // Prepara dados para o Gráfico (Gifted Charts)
  const chartData = gd?.graphs.map(g => ({
    value: g.value / 100, // Converte centavos para reais
    label: format(new Date(g.label), 'dd', { locale: ptBR }), // Dia do mês
    frontColor: theme.colors.primary,
    topLabelComponent: () => (
      <View style={{ width: 42, alignItems: 'center' }}>
        <Text style={{ color: theme.colors.onSurface, fontSize: 9, marginBottom: 4, fontWeight: 'bold' }}>
          {formatMoney(g.value, gd.currency).replace('R$', '').trim()}
        </Text>
      </View>
    ),
  })) || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                Olá, {user?.name || 'Usuário'}!
              </Text>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <MaterialCommunityIcons name="logout" size={22} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 }}>
              <TouchableOpacity
                onPress={() => showDatePicker('init')}
                style={[styles.dateButton, { borderColor: theme.colors.primary }]}
              >
                <MaterialCommunityIcons name="calendar-arrow-right" size={16} color={theme.colors.primary} />
                <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: 'bold', marginLeft: 4 }}>
                  {format(initDate, "dd/MM")}
                </Text>
              </TouchableOpacity>

              <Text style={{ color: theme.colors.onSurfaceVariant }}>até</Text>

              <TouchableOpacity
                onPress={() => showDatePicker('finish')}
                style={[styles.dateButton, { borderColor: theme.colors.primary }]}
              >
                <MaterialCommunityIcons name="calendar-arrow-left" size={16} color={theme.colors.primary} />
                <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: 'bold', marginLeft: 4 }}>
                  {format(finishDate, "dd/MM")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Card Principal - Faturamento Total */}
        {gd && (
          <LinearGradient
            colors={[theme.colors.primary, '#00b359']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainCard}
          >
            <View style={styles.mainCardContent}>
              <View>
                <Text style={{ color: '#000', opacity: 0.7, fontWeight: '800', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Faturamento Total
                </Text>
                <Text style={{ fontSize: 38, fontWeight: '900', color: '#000', marginTop: 8, letterSpacing: -1 }}>
                  {formatMoney(gd.billing, gd.currency)}
                </Text>
              </View>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="finance" size={32} color="#000" />
              </View>
            </View>
            <View style={styles.mainCardFooter}>
              <MaterialCommunityIcons name="information-outline" size={16} color="rgba(0,0,0,0.6)" style={{ marginRight: 4 }} />
              <Text style={{ color: 'rgba(0,0,0,0.6)', fontWeight: '700', fontSize: 13 }}>
                Referente ao período selecionado
              </Text>
            </View>
          </LinearGradient>
        )}

        {/* Cards Secundários (Hoje e Mês) - Sempre baseados no período atual */}
        {gd && (
          <View style={styles.row}>
            <Surface style={[styles.secondaryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="calendar-today" size={20} color={theme.colors.primary} />
                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>Hoje</Text>
              </View>
              <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface, marginTop: 8 }}>
                {currentPeriodData
                  ? formatMoney(currentPeriodData.today, currentPeriodData.currency)
                  : formatMoney(gd.billingToday, gd.currency)}
              </Text>
            </Surface>

            <Surface style={[styles.secondaryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="calendar-month" size={20} color={theme.colors.primary} />
                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>Mês Atual</Text>
              </View>
              <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface, marginTop: 8 }}>
                {currentPeriodData
                  ? formatMoney(currentPeriodData.month, currentPeriodData.currency)
                  : formatMoney(gd.billingMonth, gd.currency)}
              </Text>
            </Surface>
          </View>
        )}

        {/* Gráfico */}
        {gd && (
          <View style={styles.sectionContainer}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface, marginBottom: 16 }}>
              Evolução Diária
            </Text>
            <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <BarChart
                key={`${initDate.getTime()}-${finishDate.getTime()}`}
                data={chartData}
                barWidth={22}
                noOfSections={4}
                barBorderRadius={4}
                frontColor={theme.colors.primary}
                yAxisThickness={0}
                xAxisThickness={0}
                yAxisTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
                height={200}
                width={screenWidth - 64}
                initialSpacing={10}
                spacing={20}
                hideRules
              />
            </Surface>
          </View>
        )}

        {/* Métricas em Grid */}
        {gd && (
          <View style={styles.sectionContainer}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface, marginBottom: 16 }}>
              Performance
            </Text>
            <View style={styles.gridContainer}>
              <MetricItem
                label="Pedidos Criados"
                value={gd.createdOrdersCount}
                icon="shopping-outline"
                theme={theme}
              />
              <MetricItem
                label="Vendas Pagas"
                value={gd.paidOrdersCount}
                icon="check-circle-outline"
                color={theme.colors.primary}
                theme={theme}
              />
              <MetricItem
                label="Pendentes"
                value={gd.pendingOrdersCount}
                icon="clock-time-four-outline"
                color={gd.pendingOrdersCount > 0 ? '#FFB800' : theme.colors.onSurfaceVariant}
                theme={theme}
              />
              <MetricItem
                label="Ticket Médio"
                value={formatMoney(gd.averageTicketValue, gd.currency)}
                icon="cash-multiple"
                theme={theme}
                isMoney
              />
              <MetricItem
                label="Conversão"
                value={`${gd.conversionRate}%`}
                icon="chart-line-variant"
                color={gd.conversionRate > 10 ? theme.colors.primary : '#FFB800'}
                theme={theme}
                fullWidth
              />
            </View>
          </View>
        )}

        {/* Dashboards Internacionais */}
        {data?.internationalDashboards && data.internationalDashboards.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface, marginBottom: 16 }}>
              Internacional
            </Text>
            {data.internationalDashboards.map((intDash, index) => (
              <Surface key={index} style={[styles.internationalCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                <View style={styles.internationalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar.Icon icon="earth" size={32} style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.primary} />
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface, marginLeft: 12 }}>
                      {intDash.currency}
                    </Text>
                  </View>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                    {formatMoney(intDash.billing, intDash.currency)}
                  </Text>
                </View>
                <Divider style={{ marginVertical: 12, backgroundColor: theme.colors.outline, opacity: 0.2 }} />
                <View style={styles.internationalStats}>
                  <View style={styles.statItem}>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Vendas</Text>
                    <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{intDash.paidOrdersCount}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Pendentes</Text>
                    <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>{intDash.pendingOrdersCount}</Text>
                  </View>
                </View>
              </Surface>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Date Picker - Android */}
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          testID="dateTimePicker"
          value={pickerMode === 'init' ? initDate : finishDate}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onChangeDate}
          themeVariant="dark"
        />
      )}

      {/* Date Picker - iOS (usando Modal para evitar deslocamento) */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
        >
          <View style={styles.iosPickerOverlay}>
            <View style={[styles.iosPickerContainer, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={{ color: theme.colors.error, fontSize: 16 }}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={{ color: theme.colors.onSurface, fontSize: 16, fontWeight: 'bold' }}>
                  {pickerMode === 'init' ? 'Data Inicial' : 'Data Final'}
                </Text>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={{ color: theme.colors.primary, fontSize: 16, fontWeight: 'bold' }}>Confirmar</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                testID="dateTimePicker"
                value={pickerMode === 'init' ? initDate : finishDate}
                mode="date"
                display="spinner"
                onChange={onChangeDate}
                themeVariant="dark"
                style={{ height: 200 }}
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const MetricItem = ({ label, value, icon, color, theme, fullWidth }: any) => (
  <Surface style={[styles.metricCard, { backgroundColor: theme.colors.surface, width: fullWidth ? '100%' : '48%' }]} elevation={1}>
    <View style={styles.metricHeader}>
      <MaterialCommunityIcons name={icon} size={24} color={color || theme.colors.onSurfaceVariant} />
    </View>
    <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.onSurface, marginTop: 8, fontSize: 20 }}>
      {value}
    </Text>
    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
      {label}
    </Text>
  </Surface>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
  },
  logoutButton: {
    padding: 8,
  },
  mainCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mainCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12,
  },
  mainCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  secondaryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  chartCard: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 0,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  internationalCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  internationalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  internationalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  // Estilos para o DatePicker no iOS
  iosPickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  iosPickerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
});