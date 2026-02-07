import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
})
export class LoginFormComponent {
  readonly form = input.required<FormGroup>();
  readonly errorMessage = input('');

  readonly submitForm = output<void>();

  hasError(controlName: string, errorName: string): boolean {
    const control = this.form().get(controlName);
    return Boolean(control?.touched && control.hasError(errorName));
  }

  onSubmit(): void {
    this.submitForm.emit();
  }
}
