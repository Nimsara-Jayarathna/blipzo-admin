import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-admin-confirm-dialog',
  templateUrl: './admin-confirm-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Confirm Action';
  @Input() message = '';
  @Input() cancelLabel = 'Cancel';
  @Input() confirmLabel = 'Confirm';
  @Input() loading = false;
  @Input() tone: 'neutral' | 'danger' = 'neutral';

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  emitCancel(): void {
    if (!this.loading) {
      this.cancel.emit();
    }
  }

  emitConfirm(): void {
    if (!this.loading) {
      this.confirm.emit();
    }
  }

  cardClass(): string {
    if (this.tone === 'danger') {
      return 'w-full max-w-md rounded-xl border border-[#5a3140] bg-[#271821] shadow-2xl';
    }

    return 'w-full max-w-md rounded-xl border border-[#3b4b61] bg-[#1f232b] shadow-2xl';
  }

  footerClass(): string {
    if (this.tone === 'danger') {
      return 'flex gap-3 bg-[#311d27] px-6 py-4';
    }

    return 'flex gap-3 bg-[#2a2e35] px-6 py-4';
  }

  titleClass(): string {
    if (this.tone === 'danger') {
      return 'text-2xl font-bold text-[#ffd8e3]';
    }

    return 'text-2xl font-bold text-[#f3f7ff]';
  }

  messageClass(): string {
    if (this.tone === 'danger') {
      return 'mt-3 text-sm leading-7 text-[#f3b9cb]';
    }

    return 'mt-3 text-sm leading-7 text-[#c4cedd]';
  }

  cancelButtonClass(): string {
    if (this.tone === 'danger') {
      return 'h-10 flex-1 rounded-lg bg-[#51414a] text-sm font-bold text-[#fce9ef] transition hover:bg-[#64515b] disabled:cursor-not-allowed disabled:opacity-60';
    }

    return 'h-10 flex-1 rounded-lg bg-[#4a4f57] text-sm font-bold text-[#f2f5fa] transition hover:bg-[#585e67] disabled:cursor-not-allowed disabled:opacity-60';
  }

  confirmButtonClass(): string {
    if (this.tone === 'danger') {
      return 'h-10 flex-[1.2] rounded-lg bg-[#ec3f6d] text-sm font-bold text-white transition hover:bg-[#d7335f] disabled:cursor-not-allowed disabled:opacity-60';
    }

    return 'h-10 flex-[1.2] rounded-lg bg-[#eceef2] text-sm font-bold text-[#1d2430] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60';
  }
}
