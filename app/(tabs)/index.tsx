import { MaterialCommunityIcons } from '@expo/vector-icons';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { ActivityIndicator, Avatar, Divider, Surface, Text, useTheme } from 'react-native-paper';

// Importe seus serviços e tipos
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
  const [data, setData] = useState<DashboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  // Função que busca os dados na API
  const loadDashboard = useCallback(async () => {
    try {
      const now = new Date();
      const payload = {
        botId: null, // null pega todos os bots do usuário
        initDate: startOfMonth(now).toISOString(),
        finishDate: endOfMonth(now).toISOString()
      };

      const response = await api.post('/user/dashboard', payload);
      setData(response.data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      // Aqui você poderia adicionar um Toast/Alert de erro
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Carrega ao abrir a tela
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Função para o "Puxar para atualizar"
  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  // Loading State
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 20, color: theme.colors.onSurfaceVariant }}>Carregando métricas...</Text>
      </View>
    );
  }

  // Se não carregar nada (erro ou vazio)
  if (!data) return null;

  const gd = data.generalDashboard;

  // Prepara dados para o Gráfico (Gifted Charts)
  const chartData = gd.graphs.map(g => ({
    value: g.value / 100, // Converte centavos para reais
    label: format(new Date(g.label), 'dd', { locale: ptBR }), // Dia do mês
    frontColor: theme.colors.primary,
    topLabelComponent: () => (
      <Text style={{ color: theme.colors.onSurface, fontSize: 10, marginBottom: 4, fontWeight: 'bold' }}>
        {formatMoney(g.value, gd.currency).replace('R$', '').trim()}
      </Text>
    ),
  }));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
      }
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
            Olá, Empreendedor!
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Resumo de {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
          </Text>
        </View>
        <Avatar.Image size={40} source={{ uri: 'https://i.pravatar.cc/150' }} />
      </View>

      {/* Card Principal - Faturamento Total */}
      <LinearGradient
        colors={[theme.colors.primary, '#00b359']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mainCard}
      >
        <View style={styles.mainCardContent}>
          <View>
            <Text style={{ color: '#000', opacity: 0.8, fontWeight: '600' }}>Faturamento Total</Text>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#000', marginTop: 4 }}>
              {formatMoney(gd.billing, gd.currency)}
            </Text>
          </View>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="finance" size={32} color="#000" />
          </View>
        </View>
        <View style={styles.mainCardFooter}>
          <Text style={{ color: '#000', opacity: 0.7, fontSize: 12 }}>
            Referente ao período selecionado
          </Text>
        </View>
      </LinearGradient>

      {/* Cards Secundários (Hoje e Mês) */}
      <View style={styles.row}>
        <Surface style={[styles.secondaryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="calendar-today" size={20} color={theme.colors.primary} />
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>Hoje</Text>
          </View>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface, marginTop: 8 }}>
            {formatMoney(gd.billingToday, gd.currency)}
          </Text>
        </Surface>

        <Surface style={[styles.secondaryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="calendar-month" size={20} color={theme.colors.primary} />
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>Mês Atual</Text>
          </View>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface, marginTop: 8 }}>
            {formatMoney(gd.billingMonth, gd.currency)}
          </Text>
        </Surface>
      </View>

      {/* Gráfico */}
      <View style={styles.sectionContainer}>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface, marginBottom: 16 }}>
          Evolução Diária
        </Text>
        <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <BarChart
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
            isAnimated
            hideRules
          />
        </Surface>
      </View>

      {/* Métricas em Grid */}
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

      {/* Dashboards Internacionais */}
      {data.internationalDashboards && data.internationalDashboards.length > 0 && (
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
});