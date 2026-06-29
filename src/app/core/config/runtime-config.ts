import { environment } from '../../../environments/environment';

interface RuntimeConfig {
  apiBaseUrl: string;
  apiPrefix: string;
  apiVersion: string;
  adminApiPrefix: string;
  adminApiSegment: string;
}

function sanitizeString(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function loadRuntimeConfig(): RuntimeConfig {
  const globalConfig = typeof window !== 'undefined' ? window.__BLIPZO_CONFIG__ : undefined;

  return {
    apiBaseUrl: sanitizeString(globalConfig?.apiBaseUrl, environment.apiBaseUrl),
    apiPrefix: sanitizeString(globalConfig?.apiPrefix, environment.apiPrefix),
    apiVersion: sanitizeString(globalConfig?.apiVersion, environment.apiVersion),
    adminApiPrefix: sanitizeString(globalConfig?.adminApiPrefix, environment.adminApiPrefix),
    adminApiSegment: sanitizeString(globalConfig?.adminApiSegment, environment.adminApiSegment),
  };
}

export const runtimeConfig = loadRuntimeConfig();
