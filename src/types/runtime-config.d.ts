export {};

declare global {
  interface Window {
    __BLIPZO_CONFIG__?: {
      apiBaseUrl?: string;
      apiPrefix?: string;
      apiVersion?: string;
      adminApiPrefix?: string;
      adminApiSegment?: string;
    };
  }
}
