import { runtimeConfig } from '../config/runtime-config';

function cleanSegment(segment: string): string {
  return segment.replace(/^\/+|\/+$/g, '');
}

function combineUrl(baseUrl: string, segments: string[]): string {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const path = segments.map(cleanSegment).filter(Boolean).join('/');
  return `${normalizedBase}/${path}`;
}

export function adminApiUrl(path: string): string {
  return combineUrl(runtimeConfig.apiBaseUrl, [
    runtimeConfig.apiPrefix,
    runtimeConfig.apiVersion,
    runtimeConfig.adminApiSegment,
    path,
  ]);
}

export function isAdminApiUrl(url: string): boolean {
  const adminBase = combineUrl(runtimeConfig.apiBaseUrl, [
    runtimeConfig.apiPrefix,
    runtimeConfig.apiVersion,
    runtimeConfig.adminApiSegment,
  ]);
  return url.startsWith(adminBase);
}
