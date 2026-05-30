import { HttpContextToken } from '@angular/common/http';

export const SKIP_HTTP_REQUEST_FEEDBACK = new HttpContextToken<boolean>(() => false);
export const SHOW_HTTP_REQUEST_SUCCESS = new HttpContextToken<boolean>(() => false);
export const HTTP_REQUEST_LOADING_MESSAGE = new HttpContextToken<string>(
  () => 'Processing request...',
);
export const HTTP_REQUEST_SUCCESS_MESSAGE = new HttpContextToken<string>(
  () => 'Request completed successfully.',
);
