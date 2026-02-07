import { Injectable, computed, signal } from '@angular/core';

export type HttpRequestFeedbackStatus = 'idle' | 'loading' | 'success' | 'error';

export interface HttpRequestFeedbackState {
  status: HttpRequestFeedbackStatus;
  message: string;
  activeRequestCount: number;
}

@Injectable({ providedIn: 'root' })
export class HttpRequestFeedbackService {
  private readonly activeRequestCount = signal(0);
  private readonly status = signal<HttpRequestFeedbackStatus>('idle');
  private readonly message = signal('');

  readonly state = computed<HttpRequestFeedbackState>(() => ({
    status: this.status(),
    message: this.message(),
    activeRequestCount: this.activeRequestCount(),
  }));

  beginRequest(loadingMessage: string): void {
    this.activeRequestCount.update((value) => value + 1);
    this.status.set('loading');
    this.message.set(loadingMessage);
  }

  markSuccess(successMessage: string): void {
    this.status.set('success');
    this.message.set(successMessage);
  }

  markError(errorMessage: string): void {
    this.status.set('error');
    this.message.set(errorMessage);
  }

  showError(errorMessage: string): void {
    this.markError(errorMessage);
  }

  completeRequest(): void {
    this.activeRequestCount.update((value) => Math.max(0, value - 1));

    if (this.activeRequestCount() > 0) {
      this.status.set('loading');
      return;
    }

    if (this.status() === 'loading' || this.status() === 'success') {
      this.status.set('idle');
      this.message.set('');
    }
  }

  closeModal(): void {
    this.status.set('idle');
    this.message.set('');
  }
}
