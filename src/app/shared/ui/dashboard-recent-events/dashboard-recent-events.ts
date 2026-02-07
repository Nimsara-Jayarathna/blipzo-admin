import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DashboardEvent } from '../../../core/dashboard/models/dashboard.models';

@Component({
  selector: 'app-dashboard-recent-events',
  templateUrl: './dashboard-recent-events.html',
  styleUrl: './dashboard-recent-events.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardRecentEventsComponent {
  readonly events = input.required<DashboardEvent[]>();

  levelClass(level: string): string {
    return level.toLowerCase();
  }
}
