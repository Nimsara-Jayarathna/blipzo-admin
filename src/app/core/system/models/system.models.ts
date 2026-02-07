export type SystemProviderStatus = 'ok' | 'degraded';
export type SystemBackupStatus = 'running' | 'success' | 'failed' | 'canceled' | 'never';
export type DeleteRequestStatus = 'pending' | 'approved' | 'denied';

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

export interface SystemSnapshot {
  providerHealth: {
    status: SystemProviderStatus;
    sendRatePerDay: number;
    sentToday: number;
    failedToday: number;
    usagePct: number;
    successRate: number;
  };
  dbHealth: {
    connected: boolean;
    totalSizeGb: number;
    dataSizeMb: number;
    indexSizeMb: number;
    capacityGb: number;
    usedPct: number;
    remainingGb: number;
  };
  backup: {
    lastBackupAt: string | null;
    lastBackupStatus: SystemBackupStatus;
    target: string;
    runningJob: BackupJob | null;
    lastJobId: string | null;
  };
  deleteRequests: {
    total: number;
    pending: number;
  };
}

export interface ProviderUsageHistory {
  selectedDate: string;
  summary: {
    sent: number;
    limit: number;
    usagePct: number;
    successRate: number;
    failed: number;
  };
  history: Array<{
    date: string;
    sent: number;
    failed: number;
    limit: number;
    usagePct: number;
    successRate: number;
  }>;
  hourlyDistribution: Array<{
    hour: number;
    count: number;
  }>;
  failedEvents: Array<{
    timestamp: string;
    message: string;
  }>;
}

export interface BackupJob {
  id: string;
  status: Exclude<SystemBackupStatus, 'never'>;
  progress: number;
  stage: string;
  target: string;
  startedAt: string | null;
  completedAt: string | null;
  fileName: string | null;
  fileSizeBytes: number | null;
  errorCode: string | null;
  errorMessage: string | null;
}

export interface DeleteRequest {
  id: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  status: DeleteRequestStatus;
  reason: string;
  requestedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNote: string | null;
}

export interface DeleteRequestsResponse {
  requests: DeleteRequest[];
  summary: {
    pending: number;
    approved: number;
    denied: number;
    total: number;
  };
}
