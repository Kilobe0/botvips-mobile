import { endOfMonth, format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { ActivityIndicator, Avatar, Card, Divider, Text, useTheme } from 'react-native-paper';

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
      <Text style={{ color: theme.colors.onSurface, fontSize: 10, marginBottom: 4 }}>
        {formatMoney(g.value, gd.currency)}
      </Text>
    ),
  }));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
      }
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
          Visão Geral
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
        </Text>
      </View>

      {/* Cards de Faturamento */}
      <View style={styles.row}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Hoje</Text>
            <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
              {formatMoney(gd.billingToday, gd.currency)}
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.primaryContainer }]}>
          <Card.Content>
            <Text variant="labelSmall" style={{ color: theme.colors.primary }}>Mês Atual</Text>
            <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
              {formatMoney(gd.billingMonth, gd.currency)}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Card de Faturamento Total do Período */}
      <Card style={[styles.fullCard, { backgroundColor: theme.colors.secondaryContainer }]}>
        <Card.Content>
          <View style={styles.totalBillingRow}>
            <View>
              <Text variant="labelMedium" style={{ color: theme.colors.onSecondaryContainer }}>Faturamento Total (Período)</Text>
              <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onSecondaryContainer, marginTop: 8 }}>
                {formatMoney(gd.billing, gd.currency)}
              </Text>
            </View>
            <Avatar.Icon icon="cash-multiple" size={48} style={{ backgroundColor: theme.colors.secondary }} color={theme.colors.onSecondary} />
          </View>
        </Card.Content>
      </Card>

      {/* Gráfico */}
      <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Title
          title="Evolução Diária"
          titleStyle={{ color: theme.colors.onSurface, fontWeight: 'bold', fontSize: 18 }}
        />
        <Card.Content>
          <View style={{ overflow: 'hidden', marginLeft: -20 }}>
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
              width={screenWidth - 80} // Ajuste para caber no card
              initialSpacing={20}
              isAnimated
            />
          </View>
        </Card.Content>
      </Card>

      {/* Lista de Métricas */}
      <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Title
          title="Performance"
          titleStyle={{ color: theme.colors.onSurface, fontWeight: 'bold' }}
          left={(props) => <Avatar.Icon {...props} icon="chart-line" style={{ backgroundColor: theme.colors.surfaceVariant }} color={theme.colors.primary} />}
        />
        <Card.Content>

          <MetricRow label="Pedidos Criados" value={gd.createdOrdersCount} theme={theme} />
          <Divider style={{ backgroundColor: theme.colors.outline, opacity: 0.2 }} />

          <MetricRow label="Vendas Pagas" value={gd.paidOrdersCount} theme={theme} icon="check-circle" />
          <Divider style={{ backgroundColor: theme.colors.outline, opacity: 0.2 }} />

          <MetricRow
            label="Pedidos Pendentes"
            value={gd.pendingOrdersCount}
            theme={theme}
            icon="clock-outline"
            color={gd.pendingOrdersCount > 0 ? '#FFB800' : theme.colors.onSurfaceVariant}
          />
          <Divider style={{ backgroundColor: theme.colors.outline, opacity: 0.2 }} />

          <MetricRow label="Ticket Médio" value={formatMoney(gd.averageTicketValue, gd.currency)} theme={theme} icon="currency-usd" />
          <Divider style={{ backgroundColor: theme.colors.outline, opacity: 0.2 }} />

          <MetricRow
            label="Taxa de Conversão"
            value={`${gd.conversionRate}%`}
            color={gd.conversionRate > 10 ? theme.colors.primary : '#FFB800'}
            theme={theme}
            icon="chart-line-variant"
          />

        </Card.Content>
      </Card>

      {/* Dashboards Internacionais (Se houver) */}
      {data.internationalDashboards && data.internationalDashboards.length > 0 && (
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title
            title="Vendas Internacionais"
            titleStyle={{ color: theme.colors.onSurface, fontWeight: 'bold' }}
            left={(props) => <Avatar.Icon {...props} icon="earth" style={{ backgroundColor: theme.colors.surfaceVariant }} color={theme.colors.primary} />}
          />
          <Card.Content>
            {data.internationalDashboards.map((intDash, index) => (
              <View key={index}>
                <View style={styles.internationalRow}>
                  <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                    {intDash.currency}
                  </Text>
                  <Text variant="bodyLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                    {formatMoney(intDash.billing, intDash.currency)}
                  </Text>
                </View>
                <View style={styles.internationalDetails}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Vendas: {intDash.paidOrdersCount} | Pendentes: {intDash.pendingOrdersCount}
                  </Text>
                </View>
                {index < data.internationalDashboards.length - 1 && (
                  <Divider style={{ backgroundColor: theme.colors.outline, opacity: 0.2, marginVertical: 8 }} />
                )}
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

    </ScrollView>
  );
}

// Componente auxiliar para linhas de métricas
const MetricRow = ({ label, value, color, theme, icon }: any) => (
  <View style={styles.metricRow}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {icon && <Avatar.Icon icon={icon} size={24} style={{ backgroundColor: 'transparent' }} color={theme.colors.onSurfaceVariant} />}
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{label}</Text>
    </View>
    <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: color || theme.colors.onSurface }}>
      {value}
    </Text>
  </View>
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
    marginTop: 20,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    borderRadius: 12,
  },
  sectionCard: {
    marginBottom: 24,
    borderRadius: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  fullCard: {
    marginBottom: 24,
    borderRadius: 16,
  },
  totalBillingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  internationalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  internationalDetails: {
    paddingBottom: 8,
  },
});