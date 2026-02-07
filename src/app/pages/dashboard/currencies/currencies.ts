import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize, take } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CurrenciesService } from '../../../core/currencies/currencies.service';
import {
  AdminCurrency,
  CurrencyFormPayload,
  CurrencyStatus,
} from '../../../core/currencies/models/currencies.models';
import { AdminCurrencyModalComponent } from '../../../shared/ui/admin-currency-modal/admin-currency-modal';
import { AdminCurrencyListComponent } from '../../../shared/ui/admin-currency-list/admin-currency-list';

@Component({
  selector: 'app-currencies',
  imports: [CommonModule, ReactiveFormsModule, AdminCurrencyListComponent, AdminCurrencyModalComponent],
  templateUrl: './currencies.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Currencies implements OnInit {
  private readonly currenciesService = inject(CurrenciesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);

  readonly pageSize = Math.max(1, Number(environment.adminCurrenciesPageSize) || 10);
  readonly filterStatusOptions: Array<'ALL' | CurrencyStatus> = ['ALL', 'DEFAULT', 'ENABLED', 'DISABLED'];
  readonly filterForm = this.fb.nonNullable.group({
    code: '',
    name: '',
    symbol: '',
    status: 'ALL' as 'ALL' | CurrencyStatus,
  });

  readonly currencyForm = this.fb.nonNullable.group({
    code: '',
    name: '',
    symbol: '',
    isActive: true,
    isDefault: false,
  });

  allCurrencies: AdminCurrency[] = [];
  filteredCurrencies: AdminCurrency[] = [];
  pagedCurrencies: AdminCurrency[] = [];

  isLoading = true;
  errorMessage = '';
  currentPage = 1;

  isModalOpen = false;
  isSaving = false;
  modalErrorMessage = '';
  selectedCurrencyId: string | null = null;
  isCreateMode = false;

  ngOnInit(): void {
    this.loadCurrencies();
  }

  onApplyFilter(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.updatePagedCurrencies();
  }

  onRetry(): void {
    this.loadCurrencies();
  }

  openCreateModal(): void {
    this.isCreateMode = true;
    this.selectedCurrencyId = null;
    this.modalErrorMessage = '';
    this.currencyForm.setValue({
      code: '',
      name: '',
      symbol: '',
      isActive: true,
      isDefault: false,
    });
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  openEditModal(currency: AdminCurrency): void {
    this.isCreateMode = false;
    this.selectedCurrencyId = currency.id;
    this.modalErrorMessage = '';
    this.isModalOpen = true;
    this.cdr.markForCheck();

    this.currenciesService
      .getCurrencyById(currency.id)
      .pipe(take(1))
      .subscribe({
        next: (detail) => {
          this.currencyForm.setValue({
            code: detail.code,
            name: detail.name,
            symbol: detail.symbol,
            isActive: detail.isActive,
            isDefault: detail.isDefault,
          });
          this.cdr.markForCheck();
        },
        error: () => {
          this.modalErrorMessage = 'Unable to load currency details.';
          this.cdr.markForCheck();
        },
      });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.modalErrorMessage = '';
    this.selectedCurrencyId = null;
    this.isCreateMode = false;
    this.cdr.markForCheck();
  }

  saveCurrency(): void {
    if (this.isSaving) {
      return;
    }

    const formValue = this.currencyForm.getRawValue();
    const payload: CurrencyFormPayload = {
      code: formValue.code.trim().toUpperCase(),
      name: formValue.name.trim(),
      symbol: formValue.symbol.trim(),
      isActive: Boolean(formValue.isActive),
      isDefault: Boolean(formValue.isDefault),
    };

    this.isSaving = true;
    this.modalErrorMessage = '';
    this.cdr.markForCheck();

    const request$ = this.isCreateMode
      ? this.currenciesService.createCurrency(payload)
      : this.currenciesService.updateCurrency(this.selectedCurrencyId as string, payload);

    request$
      .pipe(
        take(1),
        finalize(() => {
          this.isSaving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (currency) => {
          this.upsertCurrency(currency);
          this.closeModal();
        },
        error: () => {
          this.modalErrorMessage = 'Unable to save currency.';
          this.cdr.markForCheck();
        },
      });
  }

  onToggleStatus(currency: AdminCurrency): void {
    const nextActive = !currency.isActive;
    this.currenciesService
      .toggleStatus(currency.id, nextActive)
      .pipe(take(1))
      .subscribe({
        next: (updated) => this.upsertCurrency(updated),
        error: () => {
          this.errorMessage = 'Unable to update currency status.';
          this.cdr.markForCheck();
        },
      });
  }

  onSetDefault(currency: AdminCurrency): void {
    if (currency.isDefault) {
      return;
    }
    this.currenciesService
      .setDefault(currency.id)
      .pipe(take(1))
      .subscribe({
        next: (updated) => this.upsertCurrency(updated),
        error: () => {
          this.errorMessage = 'Unable to update default currency.';
          this.cdr.markForCheck();
        },
      });
  }

  modalTitle(): string {
    return this.isCreateMode ? 'Add New Currency' : 'Currency Details';
  }

  get totalPages(): number {
    if (this.filteredCurrencies.length === 0) {
      return 1;
    }
    return Math.ceil(this.filteredCurrencies.length / this.pageSize);
  }

  get showPagination(): boolean {
    return this.filteredCurrencies.length > this.pageSize;
  }

  get showingStart(): number {
    if (this.filteredCurrencies.length === 0) {
      return 0;
    }
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredCurrencies.length);
  }

  get visiblePages(): number[] {
    const maxVisible = 3;
    const total = this.totalPages;
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, idx) => idx + 1);
    }
    let start = Math.max(1, this.currentPage - 1);
    let end = start + maxVisible - 1;
    if (end > total) {
      end = total;
      start = end - maxVisible + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
  }

  private loadCurrencies(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.currenciesService
      .getCurrencies()
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (data) => {
          this.allCurrencies = data.currencies.map((currency) => this.normalizeStatus(currency));
          this.currentPage = 1;
          this.applyFilters();
        },
        error: () => {
          this.allCurrencies = [];
          this.filteredCurrencies = [];
          this.pagedCurrencies = [];
          this.errorMessage = 'Unable to load currencies. Please retry.';
          this.cdr.markForCheck();
        },
      });
  }

  private applyFilters(): void {
    const filter = this.filterForm.getRawValue();
    const code = filter.code.trim().toLowerCase();
    const name = filter.name.trim().toLowerCase();
    const symbol = filter.symbol.trim().toLowerCase();

    this.filteredCurrencies = this.allCurrencies.filter((currency) => {
      const matchesCode = !code || currency.code.toLowerCase().includes(code);
      const matchesName = !name || currency.name.toLowerCase().includes(name);
      const matchesSymbol = !symbol || currency.symbol.toLowerCase().includes(symbol);
      const matchesStatus = filter.status === 'ALL' || currency.status === filter.status;
      return matchesCode && matchesName && matchesSymbol && matchesStatus;
    });

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    this.updatePagedCurrencies();
  }

  private updatePagedCurrencies(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedCurrencies = this.filteredCurrencies.slice(start, start + this.pageSize);
    this.cdr.markForCheck();
  }

  private upsertCurrency(currency: AdminCurrency): void {
    const normalized = this.normalizeStatus(currency);
    const index = this.allCurrencies.findIndex((entry) => entry.id === normalized.id);

    if (normalized.isDefault) {
      this.allCurrencies = this.allCurrencies.map((entry) =>
        entry.id === normalized.id
          ? normalized
          : {
              ...entry,
              isDefault: false,
              status: entry.isActive ? 'ENABLED' : 'DISABLED',
            },
      );
    } else if (index >= 0) {
      this.allCurrencies[index] = normalized;
    } else {
      this.allCurrencies = [normalized, ...this.allCurrencies];
    }

    if (!this.allCurrencies.find((entry) => entry.id === normalized.id)) {
      this.allCurrencies = [normalized, ...this.allCurrencies];
    }

    this.applyFilters();
  }

  private normalizeStatus(currency: AdminCurrency): AdminCurrency {
    if (currency.isDefault) {
      return { ...currency, isActive: true, status: 'DEFAULT' };
    }
    return { ...currency, status: currency.isActive ? 'ENABLED' : 'DISABLED' };
  }
}
