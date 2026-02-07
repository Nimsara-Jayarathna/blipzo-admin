import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

export type AuthFeedbackState = 'idle' | 'loading' | 'error' | 'success';

@Component({
  selector: 'app-auth-feedback',
  imports: [CommonModule],
  templateUrl: './auth-feedback.html',
  styleUrl: './auth-feedback.css',
})
export class AuthFeedbackComponent {
  readonly state = input<AuthFeedbackState>('idle');
  readonly message = input('');

  readonly loadingMessage = input('Signing in...');
  readonly successMessage = input('Login successful.');
}
