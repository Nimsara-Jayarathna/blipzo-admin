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
      'rounded-lg border border-[#334459] bg-[#111b29] px-4 py-2 text-[1.15rem] font-semibold text-[#92a3bd] disabled:cursor-not-allowed disabled:opacity-50';
    return this.selectedPeriod() === period
      ? `${base} border-[#5a6f89] bg-[#0f1723] text-[#e9f2ff]`
      : base;
  }

  segmentBarClass(index: number): string {
    const base = 'h-[0.72rem] w-[4.6rem] rounded-full';
    if (index === 0) {
      return `${base} bg-[#2994ff]`;
    }
    if (index === 1) {
      return `${base} bg-[#1f6fbf]`;
    }
    return `${base} bg-[#3c4f66]`;
  }
}
