import { runtimeConfig } from '../config/runtime-config';

function cleanSegment(segment: string): string {
  return segment.replace(/^\/+|\/+$/g, '');
}

function combineUrl(baseUrl: string, segments: string[]): string {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const path = segments.map(cleanSegment).filter(Boolean).join('/');
  return `${normalizedBase}/${path}`;
}

export function publicApiBaseUrl(): string {
  return combineUrl(runtimeConfig.apiBaseUrl, [runtimeConfig.apiPrefix, runtimeConfig.apiVersion]);
}

export function adminApiBaseUrl(): string {
  return combineUrl(runtimeConfig.apiBaseUrl, [
    runtimeConfig.adminApiPrefix,
    runtimeConfig.adminApiSegment,
  ]);
}

export function adminApiUrl(path: string): string {
  return combineUrl(adminApiBaseUrl(), [path]);
}

export function isAdminApiUrl(url: string): boolean {
  return url.startsWith(adminApiBaseUrl());
}
