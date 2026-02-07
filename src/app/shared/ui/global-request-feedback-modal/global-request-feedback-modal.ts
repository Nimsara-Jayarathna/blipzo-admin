import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HttpRequestFeedbackService } from '../../../core/http/http-request-feedback.service';

@Component({
  selector: 'app-global-request-feedback-modal',
  templateUrl: './global-request-feedback-modal.html',
  styleUrl: './global-request-feedback-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalRequestFeedbackModalComponent {
  readonly feedbackService = inject(HttpRequestFeedbackService);
  readonly state = this.feedbackService.state;

  readonly isVisible = computed(() => this.state().status !== 'idle');
  readonly isError = computed(() => this.state().status === 'error');
  readonly isLoading = computed(() => this.state().status === 'loading');

  close(): void {
    this.feedbackService.closeModal();
  }
}
