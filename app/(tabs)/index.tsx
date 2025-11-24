import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, ActivityIndicator, useTheme, Avatar, Divider } from 'react-native-paper';
import { BarChart } from 'react-native-gifted-charts';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importe seus serviços e tipos
import api from '@/services/api';
import { DashboardResult } from '@/types/api';

// Helper local para formatar moeda (Cents -> BRL)
const formatMoney = (cents: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
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
        {formatMoney(g.value / 100)}
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
              {formatMoney(gd.billingToday)}
            </Text>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.primaryContainer }]}>
          <Card.Content>
            <Text variant="labelSmall" style={{ color: theme.colors.primary }}>Mês Atual</Text>
            <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
              {formatMoney(gd.billingMonth)}
            </Text>
          </Card.Content>
        </Card>
      </View>

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
          
          <MetricRow label="Vendas Pagas" value={gd.paidOrdersCount} theme={theme} />
          <Divider style={{ backgroundColor: theme.colors.outline, opacity: 0.2 }} />
          
          <MetricRow label="Ticket Médio" value={formatMoney(gd.averageTicketValue)} theme={theme} />
          <Divider style={{ backgroundColor: theme.colors.outline, opacity: 0.2 }} />
          
          <MetricRow 
            label="Taxa de Conversão" 
            value={`${gd.conversionRate}%`} 
            color={gd.conversionRate > 10 ? theme.colors.primary : '#FFB800'} 
            theme={theme}
          />

        </Card.Content>
      </Card>

    </ScrollView>
  );
}

// Componente auxiliar para linhas de métricas
const MetricRow = ({ label, value, color, theme }: any) => (
  <View style={styles.metricRow}>
    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{label}</Text>
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
});