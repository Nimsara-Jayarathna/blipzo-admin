import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DashboardEvent } from '../../../core/dashboard/models/dashboard.models';

@Component({
  selector: 'app-dashboard-recent-events',
  templateUrl: './dashboard-recent-events.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardRecentEventsComponent {
  readonly events = input.required<DashboardEvent[]>();

  levelClass(level: string): string {
    return level.toLowerCase();
  }

  levelChipClass(level: string): string {
    const base = 'inline-flex rounded-md px-2 py-1 text-[0.7rem] font-bold uppercase';
    switch (this.levelClass(level)) {
      case 'error':
        return `${base} bg-[rgba(244,63,94,0.14)] text-[#f43f5e]`;
      case 'warn':
        return `${base} bg-[rgba(245,158,11,0.14)] text-[#f59e0b]`;
      case 'info':
        return `${base} bg-[rgba(59,130,246,0.14)] text-[#3b82f6]`;
      case 'update':
        return `${base} bg-[rgba(16,185,129,0.14)] text-[#10b981]`;
      default:
        return `${base} bg-slate-500/20 text-slate-300`;
    }
  }
}
