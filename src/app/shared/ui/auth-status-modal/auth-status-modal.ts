import { Component, input } from '@angular/core';

export type AuthModalState = 'hidden' | 'loading' | 'success';

@Component({
  selector: 'app-auth-status-modal',
  templateUrl: './auth-status-modal.html',
})
export class AuthStatusModalComponent {
  readonly state = input<AuthModalState>('hidden');
}
