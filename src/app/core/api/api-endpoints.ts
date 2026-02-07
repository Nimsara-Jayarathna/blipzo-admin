import { environment } from '../../../environments/environment';

function cleanSegment(segment: string): string {
  return segment.replace(/^\/+|\/+$/g, '');
}

function combineUrl(baseUrl: string, segments: string[]): string {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const path = segments.map(cleanSegment).filter(Boolean).join('/');
  return `${normalizedBase}/${path}`;
}

export function adminApiUrl(path: string): string {
  return combineUrl(environment.apiBaseUrl, [
    environment.apiPrefix,
    environment.apiVersion,
    environment.adminApiSegment,
    path,
  ]);
}

export function isAdminApiUrl(url: string): boolean {
  const adminBase = combineUrl(environment.apiBaseUrl, [
    environment.apiPrefix,
    environment.apiVersion,
    environment.adminApiSegment,
  ]);
  return url.startsWith(adminBase);
}
