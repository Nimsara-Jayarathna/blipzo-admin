import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-category-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-category-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategoryModalComponent {
  @Input() open = false;
  @Input() title = 'Add Category';
  @Input() submitLabel = 'Add Category';
  @Input() saving = false;
  @Input() errorMessage = '';
  @Input() form!: FormGroup;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
}
