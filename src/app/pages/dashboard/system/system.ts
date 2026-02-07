import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { catchError, finalize, forkJoin, interval, of, startWith, Subscription, switchMap, take } from 'rxjs';
import { SystemService } from '../../../core/system/system.service';
import { BackupJob, DeleteRequest, ProviderUsageHistory, SystemSnapshot } from '../../../core/system/models/system.models';
import { AdminConfirmDialogComponent } from '../../../shared/ui/admin-confirm-dialog/admin-confirm-dialog';
import { AdminSystemBackupModalComponent } from '../../../shared/ui/admin-system-backup-modal/admin-system-backup-modal';
import { AdminSystemProviderUsageModalComponent } from '../../../shared/ui/admin-system-provider-usage-modal/admin-system-provider-usage-modal';

@Component({
  selector: 'app-system',
  imports: [
    CommonModule,
    AdminConfirmDialogComponent,
    AdminSystemBackupModalComponent,
    AdminSystemProviderUsageModalComponent,
  ],
  templateUrl: './system.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class System implements OnInit, OnDestroy {
  private readonly systemService = inject(SystemService);
  private readonly cdr = inject(ChangeDetectorRef);

  snapshot: SystemSnapshot | null = null;
  deleteRequests: DeleteRequest[] = [];

  isLoading = true;
  errorMessage = '';

  isProviderModalOpen = false;
  isProviderLoading = false;
  providerErrorMessage = '';
  providerUsage: ProviderUsageHistory | null = null;

  isBackupConfirmOpen = false;
  isBackupStarting = false;

  isBackupModalOpen = false;
  backupJob: BackupJob | null = null;
  isBackupCanceling = false;

  isDecisionConfirmOpen = false;
  isDecisionSaving = false;
  pendingDecision: { request: DeleteRequest; decision: 'approve' | 'deny' } | null = null;

  private backupPollingSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.loadPage();
  }

  ngOnDestroy(): void {
    this.stopBackupPolling();
  }

  onRetry(): void {
    this.loadPage();
  }

  openProviderUsage(): void {
    this.isProviderModalOpen = true;
    this.isProviderLoading = true;
    this.providerErrorMessage = '';
    this.providerUsage = null;
    this.cdr.markForCheck();

    this.systemService
      .getProviderUsage()
      .pipe(
        take(1),
        finalize(() => {
          this.isProviderLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (data) => {
          this.providerUsage = data;
          this.cdr.markForCheck();
        },
        error: () => {
          this.providerErrorMessage = 'Unable to load provider usage history.';
          this.cdr.markForCheck();
        },
      });
  }

  closeProviderUsage(): void {
    this.isProviderModalOpen = false;
    this.cdr.markForCheck();
  }

  openBackupConfirm(): void {
    this.isBackupConfirmOpen = true;
    this.cdr.markForCheck();
  }

  closeBackupConfirm(): void {
    this.isBackupConfirmOpen = false;
    this.cdr.markForCheck();
  }

  confirmRunBackup(): void {
    if (this.isBackupStarting) {
      return;
    }

    this.isBackupStarting = true;
    this.cdr.markForCheck();

    this.systemService
      .startBackup()
      .pipe(
        take(1),
        finalize(() => {
          this.isBackupStarting = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (job) => {
          this.isBackupConfirmOpen = false;
          this.isBackupModalOpen = true;
          this.backupJob = job;
          this.startBackupPolling(job.id);
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Unable to start backup process.';
          this.cdr.markForCheck();
        },
      });
  }

  closeBackupModal(): void {
    if (this.backupJob?.status === 'running') {
      return;
    }
    this.isBackupModalOpen = false;
    this.cdr.markForCheck();
  }

  cancelBackup(): void {
    if (!this.backupJob || this.backupJob.status !== 'running' || this.isBackupCanceling) {
      return;
    }

    this.isBackupCanceling = true;
    this.cdr.markForCheck();

    this.systemService
      .cancelBackup(this.backupJob.id)
      .pipe(
        take(1),
        finalize(() => {
          this.isBackupCanceling = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (job) => {
          this.backupJob = job;
          this.stopBackupPolling();
          this.loadSnapshotOnly();
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Unable to cancel backup.';
          this.cdr.markForCheck();
        },
      });
  }

  downloadBackup(): void {
    if (!this.backupJob || this.backupJob.status !== 'success') {
      return;
    }

    const url = this.systemService.getBackupDownloadUrl(this.backupJob.id);
    window.open(url, '_blank', 'noopener');
  }

  openDeleteDecision(request: DeleteRequest, decision: 'approve' | 'deny'): void {
    this.pendingDecision = { request, decision };
    this.isDecisionConfirmOpen = true;
    this.cdr.markForCheck();
  }

  closeDeleteDecision(): void {
    if (this.isDecisionSaving) {
      return;
    }
    this.isDecisionConfirmOpen = false;
    this.pendingDecision = null;
    this.cdr.markForCheck();
  }

  confirmDeleteDecision(): void {
    if (!this.pendingDecision || this.isDecisionSaving) {
      return;
    }

    this.isDecisionSaving = true;
    this.cdr.markForCheck();

    this.systemService
      .decideDeleteRequest(this.pendingDecision.request.id, this.pendingDecision.decision)
      .pipe(
        take(1),
        finalize(() => {
          this.isDecisionSaving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.isDecisionConfirmOpen = false;
          this.pendingDecision = null;
          this.loadDeleteRequestsOnly();
          this.loadSnapshotOnly();
        },
        error: () => {
          this.errorMessage = 'Unable to update delete request status.';
          this.cdr.markForCheck();
        },
      });
  }

  statusClass(status: DeleteRequest['status']): string {
    if (status === 'approved') {
      return 'rounded bg-[rgba(16,185,129,0.12)] px-2 py-0.5 text-[0.68rem] font-bold uppercase text-[#10d39f]';
    }

    if (status === 'denied') {
      return 'rounded bg-[rgba(244,63,94,0.12)] px-2 py-0.5 text-[0.68rem] font-bold uppercase text-[#ff547f]';
    }

    return 'rounded bg-[rgba(245,158,11,0.12)] px-2 py-0.5 text-[0.68rem] font-bold uppercase text-[#f5b14a]';
  }

  formatDate(isoDate: string | null): string {
    if (!isoDate) {
      return 'N/A';
    }

    const date = new Date(isoDate);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
  }

  formatLastBackupDate(): string {
    return this.formatDate(this.snapshot?.backup.lastBackupAt ?? null);
  }

  backupStatusChipClass(): string {
    const status = this.snapshot?.backup.lastBackupStatus;
    if (status === 'success') {
      return 'rounded bg-[rgba(16,185,129,0.12)] px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#10d39f]';
    }
    if (status === 'failed') {
      return 'rounded bg-[rgba(244,63,94,0.12)] px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#ff547f]';
    }
    if (status === 'running') {
      return 'rounded bg-[rgba(46,155,255,0.12)] px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#2e9bff]';
    }
    if (status === 'canceled') {
      return 'rounded bg-[rgba(148,163,184,0.15)] px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#b7c5d8]';
    }
    return 'rounded bg-[rgba(148,163,184,0.15)] px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#b7c5d8]';
  }

  providerStatusClass(): string {
    return this.snapshot?.providerHealth.status === 'ok'
      ? 'rounded bg-[rgba(16,185,129,0.12)] px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#10d39f]'
      : 'rounded bg-[rgba(245,158,11,0.12)] px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#f5b14a]';
  }

  confirmDecisionTitle(): string {
    if (!this.pendingDecision) {
      return 'Confirm Action';
    }

    return this.pendingDecision.decision === 'approve'
      ? 'Confirm Deletion Approval'
      : 'Confirm Deletion Denial';
  }

  confirmDecisionMessage(): string {
    if (!this.pendingDecision) {
      return '';
    }

    if (this.pendingDecision.decision === 'approve') {
      return `Approve deletion request for ${this.pendingDecision.request.userName}? This permanently removes user data.`;
    }

    return `Deny deletion request for ${this.pendingDecision.request.userName}?`;
  }

  confirmDecisionTone(): 'neutral' | 'danger' {
    return this.pendingDecision?.decision === 'approve' ? 'danger' : 'neutral';
  }

  confirmDecisionButtonLabel(): string {
    return this.pendingDecision?.decision === 'approve' ? 'Approve & Delete' : 'Deny Request';
  }

  private loadPage(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    forkJoin({
      snapshot: this.systemService.getSnapshot(),
      deleteRequests: this.systemService.getDeleteRequests('pending'),
    })
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: ({ snapshot, deleteRequests }) => {
          this.snapshot = snapshot;
          this.deleteRequests = deleteRequests.requests;

          if (snapshot.backup.runningJob) {
            this.backupJob = snapshot.backup.runningJob;
            this.isBackupModalOpen = true;
            this.startBackupPolling(snapshot.backup.runningJob.id);
          }

          this.cdr.markForCheck();
        },
        error: () => {
          this.snapshot = null;
          this.deleteRequests = [];
          this.errorMessage = 'Unable to load system data. Please retry.';
          this.cdr.markForCheck();
        },
      });
  }

  private loadSnapshotOnly(): void {
    this.systemService
      .getSnapshot()
      .pipe(take(1))
      .subscribe({
        next: (snapshot) => {
          this.snapshot = snapshot;
          this.cdr.markForCheck();
        },
        error: () => {
          this.cdr.markForCheck();
        },
      });
  }

  private loadDeleteRequestsOnly(): void {
    this.systemService
      .getDeleteRequests('pending')
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.deleteRequests = response.requests;
          this.cdr.markForCheck();
        },
        error: () => {
          this.cdr.markForCheck();
        },
      });
  }

  private startBackupPolling(backupId: string): void {
    this.stopBackupPolling();

    this.backupPollingSubscription = interval(2000)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.systemService.getBackup(backupId).pipe(
            catchError(() => {
              this.stopBackupPolling();
              return of(null);
            }),
          ),
        ),
      )
      .subscribe((job) => {
        if (!job) {
          return;
        }

        this.backupJob = job;
        this.cdr.markForCheck();

        if (job.status !== 'running') {
          this.stopBackupPolling();
          this.loadSnapshotOnly();
        }
      });
  }

  private stopBackupPolling(): void {
    if (this.backupPollingSubscription) {
      this.backupPollingSubscription.unsubscribe();
      this.backupPollingSubscription = null;
    }
  }
}
