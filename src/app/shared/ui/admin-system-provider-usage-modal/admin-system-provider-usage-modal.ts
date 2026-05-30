import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ProviderUsageHistory } from '../../../core/system/models/system.models';

@Component({
  selector: 'app-admin-system-provider-usage-modal',
  templateUrl: './admin-system-provider-usage-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSystemProviderUsageModalComponent {
  @Input() open = false;
  @Input() loading = false;
  @Input() errorMessage = '';
  @Input() data: ProviderUsageHistory | null = null;

  @Output() close = new EventEmitter<void>();

  emitClose(): void {
    this.close.emit();
  }

  usageWidth(value: number): string {
    const bounded = Math.max(0, Math.min(100, value || 0));
    return `${bounded}%`;
  }

  hourlyMax(): number {
    if (!this.data || this.data.hourlyDistribution.length === 0) {
      return 1;
    }
    return Math.max(1, ...this.data.hourlyDistribution.map((entry) => entry.count));
  }

  barHeight(count: number): string {
    const max = this.hourlyMax();
    const percent = Math.max(8, Math.round((count / max) * 100));
    return `${percent}%`;
  }
}
