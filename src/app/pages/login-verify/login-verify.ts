import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, of, take } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { HttpRequestFeedbackService } from '../../core/http/http-request-feedback.service';
import { OtpChallengeStatus } from '../../core/auth/models/auth.models';
import { OtpCodeInputComponent } from '../../shared/ui/otp-code-input/otp-code-input';
import { OtpLockoutPanelComponent } from '../../shared/ui/otp-lockout-panel/otp-lockout-panel';

type VerifyState = 'loading' | 'idle' | 'submitting' | 'error';

@Component({
  selector: 'app-login-verify',
  imports: [OtpCodeInputComponent, OtpLockoutPanelComponent],
  templateUrl: './login-verify.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginVerify implements OnInit, OnDestroy {
  @ViewChild(OtpCodeInputComponent)
  private otpCodeInput?: OtpCodeInputComponent;

  private readonly authService = inject(AuthService);
  private readonly requestFeedbackService = inject(HttpRequestFeedbackService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  verifyState: VerifyState = 'loading';
  errorMessage = '';
  otpValue = '';
  status: OtpChallengeStatus | null = null;

  otpExpiresSeconds = 0;
  lockSeconds = 0;
  resendSeconds = 0;

  private ticker: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.loadStatus();
  }

  ngOnDestroy(): void {
    this.stopTicker();
  }

  get isLocked(): boolean {
    return this.lockSeconds > 0 || this.status?.status === 'locked';
  }

  get canVerify(): boolean {
    return !this.isLocked && this.otpValue.length === 6 && this.verifyState !== 'submitting';
  }

  get canResend(): boolean {
    return !this.isLocked && this.resendSeconds <= 0 && this.verifyState !== 'submitting';
  }

  onOtpChange(value: string): void {
    this.otpValue = value;
    if (this.verifyState === 'error') {
      this.errorMessage = '';
      this.verifyState = 'idle';
    }
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (!this.canVerify) {
      return;
    }

    this.verifyState = 'submitting';
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.authService
      .verifyOtp({ otp: this.otpValue })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.stopTicker();
          void this.router.navigate(['/dashboard']);
        },
        error: (error: Error) => {
          this.verifyState = 'error';
          this.errorMessage = error.message || 'Unable to verify code.';
          this.clearOtpEntry();
          this.requestFeedbackService.showError(this.errorMessage);
          this.refreshStatusAfterFailure();
        },
      });
  }

  onResend(): void {
    if (!this.canResend) {
      return;
    }

    this.verifyState = 'submitting';
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.authService
      .resendOtp()
      .pipe(
        take(1),
        finalize(() => {
          if (this.verifyState === 'submitting') {
            this.verifyState = 'idle';
          }
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (status) => {
          this.otpValue = '';
          this.applyStatus(status);
        },
        error: (error: Error) => {
          this.verifyState = 'error';
          this.errorMessage = error.message || 'Unable to resend code.';
          this.refreshStatusAfterFailure();
        },
      });
  }

  onBackToLogin(): void {
    this.authService
      .cancelOtpChallenge()
      .pipe(
        take(1),
        catchError(() => of(void 0)),
      )
      .subscribe(() => {
        this.stopTicker();
        void this.router.navigate(['/login']);
      });
  }

  private loadStatus(): void {
    this.verifyState = 'loading';
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.authService
      .getOtpStatus()
      .pipe(take(1))
      .subscribe({
        next: (status) => {
          this.applyStatus(status);
          this.verifyState = 'idle';
          this.cdr.markForCheck();
        },
        error: () => {
          this.stopTicker();
          void this.router.navigate(['/login']);
        },
      });
  }

  private refreshStatusAfterFailure(): void {
    this.authService
      .getOtpStatus()
      .pipe(take(1))
      .subscribe({
        next: (status) => {
          this.applyStatus(status);
          this.cdr.markForCheck();
        },
        error: () => {
          this.stopTicker();
          void this.router.navigate(['/login']);
        },
      });
  }

  private applyStatus(status: OtpChallengeStatus): void {
    this.status = status;
    this.otpExpiresSeconds = status.otpExpiresInSeconds;
    this.lockSeconds = status.lockoutRemainingSeconds;
    this.resendSeconds = status.resendAvailableInSeconds;
    this.startTicker();
  }

  private clearOtpEntry(): void {
    this.otpValue = '';
    this.otpCodeInput?.clear();
  }

  private startTicker(): void {
    this.stopTicker();
    this.ticker = setInterval(() => {
      this.otpExpiresSeconds = Math.max(0, this.otpExpiresSeconds - 1);
      this.lockSeconds = Math.max(0, this.lockSeconds - 1);
      this.resendSeconds = Math.max(0, this.resendSeconds - 1);

      if (this.otpExpiresSeconds === 0 && this.lockSeconds === 0 && this.verifyState !== 'submitting') {
        this.errorMessage = 'Verification session expired. Please login again.';
        this.verifyState = 'error';
      }

      this.cdr.markForCheck();
    }, 1000);
  }

  private stopTicker(): void {
    if (this.ticker) {
      clearInterval(this.ticker);
      this.ticker = null;
    }
  }
}
