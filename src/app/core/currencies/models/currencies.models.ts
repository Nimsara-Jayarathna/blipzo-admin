export type CurrencyStatus = 'DEFAULT' | 'ENABLED' | 'DISABLED';

export interface AdminCurrency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
  isDefault: boolean;
  status: CurrencyStatus;
}

export interface AdminCurrenciesData {
  currencies: AdminCurrency[];
  total: number;
}

export interface CurrencyFormPayload {
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
  isDefault: boolean;
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
