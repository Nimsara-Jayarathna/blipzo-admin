import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-otp-code-input',
  templateUrl: './otp-code-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpCodeInputComponent {
  @ViewChildren('otpField')
  private readonly otpFields?: QueryList<ElementRef<HTMLInputElement>>;

  readonly disabled = input(false);
  readonly invalid = input(false);

  readonly valueChange = output<string>();
  readonly submit = output<void>();

  readonly digits: string[] = ['', '', '', '', '', ''];

  get hasValue(): boolean {
    return this.digits.some((digit) => digit !== '');
  }

  clear(): void {
    this.digits.fill('');
    this.valueChange.emit('');
    this.focusField(0);
  }

  setValue(value: string): void {
    const cleaned = this.cleanInput(value).slice(0, this.digits.length);
    this.digits.fill('');
    for (let i = 0; i < cleaned.length; i += 1) {
      this.digits[i] = cleaned[i];
    }
    this.valueChange.emit(this.digits.join(''));
    this.focusField(Math.min(cleaned.length, this.digits.length - 1));
  }

  onInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = this.cleanInput(input.value);

    if (!cleaned) {
      this.digits[index] = '';
      this.valueChange.emit(this.digits.join(''));
      return;
    }

    const chars = cleaned.split('');
    let pointer = index;
    for (const char of chars) {
      if (pointer >= this.digits.length) {
        break;
      }
      this.digits[pointer] = char;
      pointer += 1;
    }

    this.valueChange.emit(this.digits.join(''));

    if (pointer < this.digits.length) {
      this.focusField(pointer);
    } else {
      this.focusField(this.digits.length - 1);
      this.submit.emit();
    }
  }

  onKeyDown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
      this.focusField(index - 1);
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusField(index - 1);
      return;
    }

    if (event.key === 'ArrowRight' && index < this.digits.length - 1) {
      event.preventDefault();
      this.focusField(index + 1);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      this.submit.emit();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') || '';
    const cleaned = this.cleanInput(pasted).slice(0, this.digits.length);
    this.setValue(cleaned);
    if (cleaned.length === this.digits.length) {
      this.submit.emit();
    }
  }

  private focusField(index: number): void {
    const input = this.otpFields?.get(index)?.nativeElement;
    if (input) {
      input.focus();
      input.select();
    }
  }

  private cleanInput(value: string): string {
    return String(value || '').replace(/\D/g, '');
  }
}
