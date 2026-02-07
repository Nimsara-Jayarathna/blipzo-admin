import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DashboardSummary } from '../../../core/dashboard/models/dashboard.models';

@Component({
  selector: 'app-dashboard-kpi-cards',
  templateUrl: './dashboard-kpi-cards.html',
  styleUrl: './dashboard-kpi-cards.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardKpiCardsComponent {
  readonly summary = input.required<DashboardSummary>();
}
