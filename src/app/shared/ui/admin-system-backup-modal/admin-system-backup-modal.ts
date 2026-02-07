import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BackupJob } from '../../../core/system/models/system.models';

@Component({
  selector: 'app-admin-system-backup-modal',
  templateUrl: './admin-system-backup-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSystemBackupModalComponent {
  @Input() open = false;
  @Input() job: BackupJob | null = null;
  @Input() cancelLoading = false;
  @Input() downloadAvailable = false;

  @Output() close = new EventEmitter<void>();
  @Output() cancelBackup = new EventEmitter<void>();
  @Output() downloadBackup = new EventEmitter<void>();

  emitClose(): void {
    if (this.job?.status === 'running') {
      return;
    }
    this.close.emit();
  }

  emitCancelBackup(): void {
    if (this.job?.status !== 'running' || this.cancelLoading) {
      return;
    }
    this.cancelBackup.emit();
  }

  emitDownloadBackup(): void {
    if (!this.downloadAvailable || this.job?.status !== 'success') {
      return;
    }
    this.downloadBackup.emit();
  }

  progressWidth(): string {
    const value = Math.max(0, Math.min(100, this.job?.progress || 0));
    return `${value}%`;
  }

  title(): string {
    if (!this.job) return 'Backup Status';
    if (this.job.status === 'running') return 'Creating Backup...';
    if (this.job.status === 'success') return 'Backup Successful';
    if (this.job.status === 'failed') return 'Backup Failed';
    return 'Backup Canceled';
  }
}
