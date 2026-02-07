export type CategoryType = 'income' | 'expense';
export type CategoryStatus = 'DEFAULT' | 'STANDARD';

export interface AdminCategory {
  id: string;
  name: string;
  type: CategoryType;
  isDefault: boolean;
  isActive: boolean;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategoryDefaults {
  income: AdminCategory | null;
  expense: AdminCategory | null;
}

export interface AdminCategorySettings {
  defaultCategoryLimit: number;
}

export interface AdminCategoriesData {
  defaults: AdminCategoryDefaults;
  settings: AdminCategorySettings;
  categories: AdminCategory[];
  total: number;
}

export interface SaveAdminCategoryPayload {
  name: string;
  type: CategoryType;
  setAsDefault: boolean;
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
