import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DashboardSummary } from '../../../core/dashboard/models/dashboard.models';

@Component({
  selector: 'app-dashboard-kpi-cards',
  templateUrl: './dashboard-kpi-cards.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardKpiCardsComponent {
  readonly summary = input.required<DashboardSummary>();

  errorDeltaClass(): string {
    if (this.summary().errorCount.deltaPct < 0) {
      return 'rounded-md bg-[rgba(244,63,94,0.16)] px-2 py-1 text-[0.72rem] font-bold text-[#f43f5e]';
    }

    return 'rounded-md bg-[#334a6a] px-2 py-1 text-[0.72rem] font-bold text-[#9ca9bf]';
  }
}
