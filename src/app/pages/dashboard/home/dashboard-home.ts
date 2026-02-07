import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { finalize, take } from 'rxjs';
import { DashboardService } from '../../../core/dashboard/dashboard.service';
import {
  DashboardPeriod,
  DashboardSnapshot,
} from '../../../core/dashboard/models/dashboard.models';
import { DashboardCurrencyUsageComponent } from '../../../shared/ui/dashboard-currency-usage/dashboard-currency-usage';
import { DashboardKpiCardsComponent } from '../../../shared/ui/dashboard-kpi-cards/dashboard-kpi-cards';
import { DashboardRecentEventsComponent } from '../../../shared/ui/dashboard-recent-events/dashboard-recent-events';

@Component({
  selector: 'app-dashboard-home',
  imports: [
    DashboardKpiCardsComponent,
    DashboardCurrencyUsageComponent,
    DashboardRecentEventsComponent,
  ],
  templateUrl: './dashboard-home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHome {
  private readonly dashboardService = inject(DashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  snapshot: DashboardSnapshot | null = null;
  selectedPeriod: DashboardPeriod = '30d';
  isLoading = true;
  errorMessage = '';

  constructor() {
    this.loadDashboard();
  }

  onPeriodChanged(period: DashboardPeriod): void {
    if (period !== this.selectedPeriod) {
      this.selectedPeriod = period;
      this.loadDashboard();
    }
  }

  onRetry(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.dashboardService
      .getSnapshot({ period: this.selectedPeriod, eventsLimit: 6 })
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (snapshot) => {
          this.snapshot = snapshot;
          this.selectedPeriod = snapshot.currencyUsage.period;
          this.cdr.markForCheck();
        },
        error: () => {
          this.snapshot = null;
          this.errorMessage = 'Unable to load dashboard data. Please retry.';
          this.cdr.markForCheck();
        },
      });
  }
}
