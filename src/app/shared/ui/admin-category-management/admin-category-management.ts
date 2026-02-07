import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminCategoriesData, AdminCategory, CategoryType } from '../../../core/categories/models/categories.models';

@Component({
  selector: 'app-admin-category-management',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-category-management.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategoryManagementComponent {
  @Input() isLoading = false;
  @Input() errorMessage = '';
  @Input() data: AdminCategoriesData | null = null;
  @Input() filteredCategories: AdminCategory[] = [];
  @Input() searchForm!: FormGroup;
  @Input() settingsForm!: FormGroup;
  @Input() isSavingLimit = false;
  @Input() settingsMessage = '';

  @Output() retry = new EventEmitter<void>();
  @Output() addCategory = new EventEmitter<void>();
  @Output() search = new EventEmitter<void>();
  @Output() updateLimit = new EventEmitter<void>();
  @Output() editCategory = new EventEmitter<AdminCategory>();
  @Output() setDefault = new EventEmitter<AdminCategory>();
  @Output() deleteCategory = new EventEmitter<AdminCategory>();

  typeClass(type: CategoryType): string {
    return type === 'income'
      ? 'rounded bg-[rgba(16,185,129,0.12)] px-2 py-0.5 text-[0.68rem] font-bold uppercase text-[#10d39f]'
      : 'rounded bg-[rgba(244,63,94,0.12)] px-2 py-0.5 text-[0.68rem] font-bold uppercase text-[#ff547f]';
  }

  trackByCategoryId(_: number, category: AdminCategory): string {
    return category.id;
  }
}
