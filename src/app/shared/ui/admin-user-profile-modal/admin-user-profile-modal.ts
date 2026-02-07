import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminUserActivityItem, AdminUserProfile, UserStatus } from '../../../core/users/models/users.models';

@Component({
  selector: 'app-admin-user-profile-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-user-profile-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserProfileModalComponent {
  @Input() open = false;
  @Input() loading = false;
  @Input() profile: AdminUserProfile | null = null;
  @Input() activity: AdminUserActivityItem[] = [];
  @Input() statusOptions: UserStatus[] = [];
  @Input() profileForm!: FormGroup;
  @Input() saving = false;
  @Input() errorMessage = '';
  @Input() successMessage = '';

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() resetPassword = new EventEmitter<void>();
  @Output() forceLogout = new EventEmitter<void>();

  displayUserId(userId: string): string {
    return userId.length > 8 ? userId.slice(-6).toUpperCase() : userId.toUpperCase();
  }

  formatDateTime(value: string | null): string {
    if (!value) {
      return 'N/A';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleString();
  }

  trackByActivityIndex(index: number): number {
    return index;
  }
}
