import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize, take } from 'rxjs';
import { CategoriesService } from '../../../core/categories/categories.service';
import {
  AdminCategory,
  AdminCategoriesData,
  CategoryType,
} from '../../../core/categories/models/categories.models';
import { AdminCategoryManagementComponent } from '../../../shared/ui/admin-category-management/admin-category-management';
import { AdminCategoryModalComponent } from '../../../shared/ui/admin-category-modal/admin-category-modal';

@Component({
  selector: 'app-categories',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AdminCategoryManagementComponent,
    AdminCategoryModalComponent,
  ],
  templateUrl: './categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Categories implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);

  readonly searchForm = this.fb.nonNullable.group({
    search: '',
  });
  readonly settingsForm = this.fb.nonNullable.group({
    defaultCategoryLimit: 10,
  });

  readonly categoryForm = this.fb.nonNullable.group({
    name: '',
    type: 'expense' as CategoryType,
    setAsDefault: false,
  });

  data: AdminCategoriesData | null = null;
  filteredCategories: AdminCategory[] = [];

  isLoading = true;
  errorMessage = '';

  isSavingLimit = false;
  settingsMessage = '';

  isModalOpen = false;
  isModalSaving = false;
  modalErrorMessage = '';
  editingCategoryId: string | null = null;

  ngOnInit(): void {
    this.loadCategories();
  }

  onRetry(): void {
    this.loadCategories();
  }

  onSearch(): void {
    const query = this.searchForm.getRawValue().search.trim().toLowerCase();
    if (!this.data) {
      this.filteredCategories = [];
      return;
    }

    if (!query) {
      this.filteredCategories = [...this.data.categories];
    } else {
      this.filteredCategories = this.data.categories.filter((category) =>
        category.name.toLowerCase().includes(query),
      );
    }
    this.cdr.markForCheck();
  }

  openAddCategory(): void {
    this.editingCategoryId = null;
    this.modalErrorMessage = '';
    this.categoryForm.setValue({
      name: '',
      type: 'expense',
      setAsDefault: false,
    });
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  openEditCategory(category: AdminCategory): void {
    this.editingCategoryId = category.id;
    this.modalErrorMessage = '';
    this.categoryForm.setValue({
      name: category.name,
      type: category.type,
      setAsDefault: category.isDefault,
    });
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  closeCategoryModal(): void {
    this.isModalOpen = false;
    this.modalErrorMessage = '';
    this.editingCategoryId = null;
    this.cdr.markForCheck();
  }

  saveCategory(): void {
    if (this.isModalSaving) {
      return;
    }

    const raw = this.categoryForm.getRawValue();
    const payload = {
      name: raw.name.trim(),
      type: raw.type,
      setAsDefault: Boolean(raw.setAsDefault),
    };

    this.isModalSaving = true;
    this.modalErrorMessage = '';
    this.cdr.markForCheck();

    const request$ = this.editingCategoryId
      ? this.categoriesService.updateCategory(this.editingCategoryId, payload)
      : this.categoriesService.createCategory(payload);

    request$
      .pipe(
        take(1),
        finalize(() => {
          this.isModalSaving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.closeCategoryModal();
          this.loadCategories();
        },
        error: () => {
          this.modalErrorMessage = 'Unable to save category.';
          this.cdr.markForCheck();
        },
      });
  }

  setDefault(category: AdminCategory): void {
    if (category.isDefault) {
      return;
    }
    this.categoriesService
      .setDefaultCategory(category.id)
      .pipe(take(1))
      .subscribe({
        next: () => this.loadCategories(),
        error: () => {
          this.errorMessage = 'Unable to set default category.';
          this.cdr.markForCheck();
        },
      });
  }

  deleteCategory(category: AdminCategory): void {
    if (category.isDefault) {
      return;
    }

    this.categoriesService
      .deleteCategory(category.id)
      .pipe(take(1))
      .subscribe({
        next: () => this.loadCategories(),
        error: () => {
          this.errorMessage = 'Unable to delete category.';
          this.cdr.markForCheck();
        },
      });
  }

  updateGlobalLimit(): void {
    if (this.isSavingLimit) {
      return;
    }

    this.isSavingLimit = true;
    this.settingsMessage = '';
    this.cdr.markForCheck();

    const nextLimit = Number(this.settingsForm.getRawValue().defaultCategoryLimit);
    this.categoriesService
      .updateGlobalCategoryLimit(nextLimit)
      .pipe(
        take(1),
        finalize(() => {
          this.isSavingLimit = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (settings) => {
          if (this.data) {
            this.data = {
              ...this.data,
              settings: { defaultCategoryLimit: settings.defaultCategoryLimit },
            };
          }
          this.settingsMessage = 'Category limit updated.';
          this.cdr.markForCheck();
        },
        error: () => {
          this.settingsMessage = 'Unable to update category limit.';
          this.cdr.markForCheck();
        },
      });
  }

  modalTitle(): string {
    return this.editingCategoryId ? 'Edit Category' : 'Add Category';
  }

  modalSubmitLabel(): string {
    return this.editingCategoryId ? 'Save Changes' : 'Add Category';
  }

  private loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.categoriesService
      .getCategories()
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (data) => {
          this.data = data;
          this.filteredCategories = [...data.categories];
          this.settingsForm.patchValue({
            defaultCategoryLimit: data.settings.defaultCategoryLimit,
          });
          this.searchForm.patchValue({ search: '' });
          this.cdr.markForCheck();
        },
        error: () => {
          this.data = null;
          this.filteredCategories = [];
          this.errorMessage = 'Unable to load categories. Please retry.';
          this.cdr.markForCheck();
        },
      });
  }
}
