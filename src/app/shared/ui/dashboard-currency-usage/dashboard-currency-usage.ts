import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  DashboardCurrencyUsage,
  DashboardPeriod,
} from '../../../core/dashboard/models/dashboard.models';

@Component({
  selector: 'app-dashboard-currency-usage',
  templateUrl: './dashboard-currency-usage.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCurrencyUsageComponent {
  readonly usage = input.required<DashboardCurrencyUsage>();
  readonly selectedPeriod = input.required<DashboardPeriod>();
  readonly isLoading = input(false);

  readonly periodChange = output<DashboardPeriod>();

  onPeriodSelect(period: DashboardPeriod): void {
    if (!this.isLoading() && period !== this.selectedPeriod()) {
      this.periodChange.emit(period);
    }
  }

  periodButtonClass(period: DashboardPeriod): string {
    const base =
      'rounded-md border border-[#3a4c68] bg-transparent px-3 py-2 text-[0.82rem] font-semibold text-[#95a3ba] disabled:cursor-not-allowed disabled:opacity-50';
    return this.selectedPeriod() === period
      ? `${base} border-[#4c8ee2] bg-[#1c2c46] text-[#e3ecfb]`
      : base;
  }
}
