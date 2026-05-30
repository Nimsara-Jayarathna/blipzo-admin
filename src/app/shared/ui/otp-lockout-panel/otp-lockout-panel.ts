import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-otp-lockout-panel',
  templateUrl: './otp-lockout-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpLockoutPanelComponent {
  readonly lockSeconds = input(0);
  readonly backToLogin = output<void>();

  readonly countdownLabel = computed(() => {
    const total = Math.max(0, this.lockSeconds());
    const minutes = Math.floor(total / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(total % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  });

  onBackToLogin(): void {
    this.backToLogin.emit();
  }
}
