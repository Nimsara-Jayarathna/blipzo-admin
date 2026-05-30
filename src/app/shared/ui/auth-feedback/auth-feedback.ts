import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

export type AuthFeedbackState = 'idle' | 'loading' | 'error' | 'success';

@Component({
  selector: 'app-auth-feedback',
  imports: [CommonModule],
  templateUrl: './auth-feedback.html',
})
export class AuthFeedbackComponent {
  readonly state = input<AuthFeedbackState>('idle');
  readonly message = input('');

  readonly loadingMessage = input('Signing in...');
  readonly successMessage = input('Login successful.');

  feedbackClass(): string {
    const base =
      'flex items-center gap-2 rounded-[0.6rem] border border-transparent px-3 py-2 text-[0.86rem]';

    if (this.state() === 'loading') {
      return `${base} border-[rgba(148,170,198,0.45)] bg-[rgba(148,170,198,0.11)] text-[#d8e6f7]`;
    }

    if (this.state() === 'success') {
      return `${base} border-[rgba(113,215,161,0.45)] bg-[rgba(84,176,129,0.12)] text-[#b5f0cf]`;
    }

    return `${base} border-[rgba(255,125,125,0.4)] bg-[rgba(255,125,125,0.08)] text-[#ff9d9d]`;
  }
}
