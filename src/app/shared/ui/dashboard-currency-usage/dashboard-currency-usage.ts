import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  DashboardCurrencyUsage,
  DashboardPeriod,
} from '../../../core/dashboard/models/dashboard.models';

@Component({
  selector: 'app-dashboard-currency-usage',
  templateUrl: './dashboard-currency-usage.html',
  styleUrl: './dashboard-currency-usage.css',
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
}
