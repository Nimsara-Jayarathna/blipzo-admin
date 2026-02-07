import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, take } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { AuthStatusModalComponent } from '../../shared/ui/auth-status-modal/auth-status-modal';
import { LoginFormComponent } from '../../shared/ui/login-form/login-form';

type LoginState = 'idle' | 'loading' | 'error';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, LoginFormComponent, AuthStatusModalComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  loginState: LoginState = 'idle';
  errorMessage = '';

  constructor() {
    this.loginForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.loginState === 'error' && !this.loginForm.disabled) {
        this.errorMessage = '';
        this.updateState('idle');
        this.cdr.markForCheck();
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.loginForm.disabled) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.loginForm.disable({ emitEvent: false });
    this.cdr.markForCheck();
    setTimeout(() => {
      this.updateState('loading');

      this.authService
        .login(this.loginForm.getRawValue())
        .pipe(
          take(1),
          finalize(() => {
            this.loginForm.enable({ emitEvent: false });
          }),
        )
        .subscribe({
          next: () => {
            void this.router.navigate(['/dashboard']).finally(() => {
              if (this.loginState === 'loading') {
                this.updateState('idle');
              }
            });
          },
          error: (error: Error) => {
            this.errorMessage = error.message || 'Unable to sign in. Please verify your credentials.';
            this.updateState('error');
            this.cdr.markForCheck();
          },
        });
    }, 0);
  }

  private updateState(state: LoginState): void {
    this.loginState = state;
    this.cdr.markForCheck();
  }
}
