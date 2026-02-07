import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import {
  AuthFeedbackComponent,
  AuthFeedbackState,
} from '../../shared/ui/auth-feedback/auth-feedback';

type LoginState = AuthFeedbackState;

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, AuthFeedbackComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  loginState: LoginState = 'idle';
  isSubmitting = false;
  errorMessage = '';
  feedbackMessage = '';
  private successRedirectTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    if (this.successRedirectTimer) {
      clearTimeout(this.successRedirectTimer);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.feedbackMessage = '';
    this.loginState = 'loading';
    this.isSubmitting = true;

    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.loginState = 'success';
          this.feedbackMessage = 'Login successful.';
          this.successRedirectTimer = setTimeout(() => {
            void this.router.navigate(['/dashboard']);
          }, 250);
        },
        error: (error: Error) => {
          this.loginState = 'error';
          this.errorMessage = error.message || 'Unable to sign in. Please verify your credentials.';
          this.feedbackMessage = this.errorMessage;
        },
      });
  }

  hasError(controlName: 'email' | 'password', errorName: string): boolean {
    const control = this.loginForm.controls[controlName];
    return control.touched && control.hasError(errorName);
  }
}
