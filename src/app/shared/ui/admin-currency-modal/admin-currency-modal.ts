import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-currency-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-currency-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCurrencyModalComponent {
  @Input() open = false;
  @Input() saving = false;
  @Input() title = 'Currency Details';
  @Input() errorMessage = '';
  @Input() form!: FormGroup;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
}
