import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DashboardSummary } from '../../../core/dashboard/models/dashboard.models';

@Component({
  selector: 'app-dashboard-kpi-cards',
  templateUrl: './dashboard-kpi-cards.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardKpiCardsComponent {
  readonly summary = input.required<DashboardSummary>();

  formatValue(value: number | string): string {
    return typeof value === 'number' ? value.toLocaleString() : value;
  }

  deltaText(delta: number): string {
    return delta > 0 ? `+${delta}` : `${delta}`;
  }

  errorDeltaClass(): string {
    if (this.summary().errorCount.deltaPct < 0) {
      return 'rounded-md bg-[rgba(244,63,94,0.16)] px-2.5 py-1 text-[0.85rem] font-bold text-[#f43f5e]';
    }

    return 'rounded-md bg-[#1f2b3a] px-2.5 py-1 text-[0.85rem] font-bold text-[#9ca9bf]';
  }
}
