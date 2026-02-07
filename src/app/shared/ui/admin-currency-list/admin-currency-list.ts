import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminCurrency, CurrencyStatus } from '../../../core/currencies/models/currencies.models';

@Component({
  selector: 'app-admin-currency-list',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-currency-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCurrencyListComponent {
  @Input() isLoading = false;
  @Input() errorMessage = '';
  @Input() filterForm!: FormGroup;
  @Input() filterStatusOptions: Array<'ALL' | CurrencyStatus> = [];
  @Input() pagedCurrencies: AdminCurrency[] = [];
  @Input() filteredCurrencies: AdminCurrency[] = [];
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() showPagination = false;
  @Input() showingStart = 0;
  @Input() showingEnd = 0;
  @Input() visiblePages: number[] = [];

  @Output() retry = new EventEmitter<void>();
  @Output() applyFilter = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() openCreate = new EventEmitter<void>();
  @Output() edit = new EventEmitter<AdminCurrency>();
  @Output() toggleStatus = new EventEmitter<AdminCurrency>();
  @Output() setDefault = new EventEmitter<AdminCurrency>();

  trackByCurrencyId(_: number, currency: AdminCurrency): string {
    return currency.id;
  }

  statusClass(currency: AdminCurrency): string {
    if (currency.isDefault) {
      return 'rounded-md border border-[rgba(19,127,236,0.2)] bg-[rgba(19,127,236,0.14)] px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[#2e9bff]';
    }
    if (currency.isActive) {
      return 'inline-flex items-center gap-1.5 text-[0.9rem] font-semibold uppercase text-[#16d3a5]';
    }
    return 'inline-flex items-center gap-1.5 text-[0.9rem] font-semibold uppercase text-[#7388a3]';
  }
}
