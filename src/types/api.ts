export interface User {
  token: string;
  name: string;
  email: string;
  fee: number;
  stripeAccountId?: string;
}

export interface DashboardFilter {
  botId?: string | null;
  initDate: string;   // ISO format
  finishDate: string; // ISO format
}

export interface GraphPoint {
  label: string;
  value: number;
}

export interface GeneralDashboard {
  billing: number;
  billingToday: number;
  billingMonth: number;
  averageTicketValue: number;
  createdOrdersCount: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  conversionRate: number;
  graphs: GraphPoint[];
  currency: string;
}

export interface DashboardResult {
  generalDashboard: GeneralDashboard;
  internationalDashboards: GeneralDashboard[]; // Pode ser vazio
}