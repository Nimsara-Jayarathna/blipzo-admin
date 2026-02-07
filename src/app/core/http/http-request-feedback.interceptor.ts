import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, finalize } from 'rxjs';
import { isAdminApiUrl } from '../api/api-endpoints';
import {
  HTTP_REQUEST_LOADING_MESSAGE,
  HTTP_REQUEST_SUCCESS_MESSAGE,
  SHOW_HTTP_REQUEST_SUCCESS,
  SKIP_HTTP_REQUEST_FEEDBACK,
} from './http-request-feedback.context';
import { HttpRequestFeedbackService } from './http-request-feedback.service';

export const httpRequestFeedbackInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isAdminApiUrl(req.url) || req.context.get(SKIP_HTTP_REQUEST_FEEDBACK)) {
    return next(req);
  }

  const feedbackService = inject(HttpRequestFeedbackService);
  const loadingMessage = req.context.get(HTTP_REQUEST_LOADING_MESSAGE);
  const showSuccess = req.context.get(SHOW_HTTP_REQUEST_SUCCESS);
  const successMessage = req.context.get(HTTP_REQUEST_SUCCESS_MESSAGE);

  feedbackService.beginRequest(loadingMessage);

  return next(req).pipe(
    tap({
      next: (event) => {
        if (showSuccess && event instanceof HttpResponse) {
          feedbackService.markSuccess(successMessage);
        }
      },
      error: (error: unknown) => {
        feedbackService.markError(extractErrorMessage(error));
      },
    }),
    finalize(() => {
      feedbackService.completeRequest();
    }),
  );
};

function extractErrorMessage(error: unknown): string {
  const fallbackMessage = 'Request failed. Please try again.';

  if (error instanceof HttpErrorResponse) {
    if (!error.error) {
      return error.message || fallbackMessage;
    }

    if (typeof error.error === 'string') {
      return error.error || error.message || fallbackMessage;
    }

    const payload = error.error as {
      message?: string;
      error?: { message?: string };
      details?: { message?: string };
    };

    return (
      payload.message ||
      payload.error?.message ||
      payload.details?.message ||
      error.message ||
      fallbackMessage
    );
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
}
