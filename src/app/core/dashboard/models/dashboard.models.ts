export type DashboardPeriod = '30d' | '90d';

export type DashboardEventLevel = 'ERROR' | 'WARN' | 'INFO' | 'UPDATE';

export interface DashboardKpi {
  value: number | string;
  deltaPct: number;
}

export interface DashboardSummary {
  totalUsers: DashboardKpi;
  activeUsers: DashboardKpi;
  defaultCurrency: DashboardKpi;
  errorCount: DashboardKpi;
}

export interface DashboardCurrencySegment {
  code: string;
  percent: number;
  amount: number;
}

export interface DashboardCurrencyUsage {
  period: DashboardPeriod;
  totalAmount: number;
  segments: DashboardCurrencySegment[];
}

export interface DashboardEvent {
  level: DashboardEventLevel;
  message: string;
  occurredAt: string;
}

export interface DashboardSnapshot {
  summary: DashboardSummary;
  currencyUsage: DashboardCurrencyUsage;
  recentEvents: DashboardEvent[];
}

export interface DashboardSnapshotQuery {
  period?: DashboardPeriod;
  eventsLimit?: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}
