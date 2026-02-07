import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize, take } from 'rxjs';
import {
  AdminUser,
  AdminUserActivityItem,
  AdminUserProfile,
  UserStatus,
} from '../../../core/users/models/users.models';
import { environment } from '../../../../environments/environment';
import { UsersService } from '../../../core/users/users.service';

@Component({
  selector: 'app-users',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Users implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);

  readonly pageSize = Math.max(1, Number(environment.adminUsersPageSize) || 10);

  readonly filterForm = this.fb.nonNullable.group({
    name: '',
    email: '',
    userId: '',
    status: 'ALL' as 'ALL' | UserStatus,
  });

  readonly statusOptions: Array<'ALL' | UserStatus> = ['ALL', 'ACTIVE', 'INACTIVE', 'SUSPENDED'];
  readonly profileStatusOptions: UserStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

  readonly profileForm = this.fb.nonNullable.group({
    email: '',
    status: 'ACTIVE' as UserStatus,
    categoryLimit: 10,
  });

  allUsers: AdminUser[] = [];
  filteredUsers: AdminUser[] = [];
  pagedUsers: AdminUser[] = [];
  selectedUserProfile: AdminUserProfile | null = null;
  selectedUserActivity: AdminUserActivityItem[] = [];

  isLoading = true;
  isProfileLoading = false;
  isProfileSaving = false;
  isResetLoading = false;
  isForceLogoutLoading = false;
  errorMessage = '';
  profileErrorMessage = '';
  profileSuccessMessage = '';
  actionMenuUserId: string | null = null;
  isProfileModalOpen = false;
  isResetConfirmOpen = false;
  isForceLogoutConfirmOpen = false;
  currentPage = 1;

  ngOnInit(): void {
    this.loadUsers();
  }

  onApplyFilter(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.updatePagedUsers();
  }

  onRetry(): void {
    this.loadUsers();
  }

  toggleActionMenu(userId: string): void {
    this.actionMenuUserId = this.actionMenuUserId === userId ? null : userId;
  }

  openUserProfile(user: AdminUser): void {
    this.actionMenuUserId = null;
    this.isProfileModalOpen = true;
    this.isResetConfirmOpen = false;
    this.isForceLogoutConfirmOpen = false;
    this.profileErrorMessage = '';
    this.profileSuccessMessage = '';
    this.selectedUserProfile = null;
    this.selectedUserActivity = [];
    this.isProfileLoading = true;
    this.cdr.markForCheck();

    this.usersService
      .getUserById(user.id)
      .pipe(
        take(1),
        finalize(() => {
          this.isProfileLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (profile) => {
          this.selectedUserProfile = profile;
          this.profileForm.setValue({
            email: profile.email,
            status: profile.status,
            categoryLimit: profile.categoryLimit,
          });
          this.loadUserActivity(user.id);
          this.cdr.markForCheck();
        },
        error: () => {
          this.profileErrorMessage = 'Unable to load user profile.';
          this.cdr.markForCheck();
        },
      });
  }

  closeProfileModal(): void {
    this.isProfileModalOpen = false;
    this.isResetConfirmOpen = false;
    this.isForceLogoutConfirmOpen = false;
    this.selectedUserProfile = null;
    this.selectedUserActivity = [];
    this.profileErrorMessage = '';
    this.profileSuccessMessage = '';
    this.actionMenuUserId = null;
    this.cdr.markForCheck();
  }

  openResetConfirm(): void {
    this.profileSuccessMessage = '';
    this.profileErrorMessage = '';
    this.isResetConfirmOpen = true;
    this.isForceLogoutConfirmOpen = false;
  }

  closeResetConfirm(): void {
    this.isResetConfirmOpen = false;
  }

  openForceLogoutConfirm(): void {
    this.profileSuccessMessage = '';
    this.profileErrorMessage = '';
    this.isForceLogoutConfirmOpen = true;
    this.isResetConfirmOpen = false;
  }

  closeForceLogoutConfirm(): void {
    this.isForceLogoutConfirmOpen = false;
  }

  saveProfileChanges(): void {
    if (!this.selectedUserProfile || this.isProfileSaving) {
      return;
    }

    this.profileErrorMessage = '';
    this.profileSuccessMessage = '';
    this.isProfileSaving = true;
    this.cdr.markForCheck();

    const formValue = this.profileForm.getRawValue();
    const payload = {
      email: formValue.email.trim(),
      status: formValue.status,
      categoryLimit: Number(formValue.categoryLimit),
    };

    this.usersService
      .updateUser(this.selectedUserProfile.id, payload)
      .pipe(
        take(1),
        finalize(() => {
          this.isProfileSaving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (profile) => {
          this.selectedUserProfile = profile;
          this.profileForm.setValue({
            email: profile.email,
            status: profile.status,
            categoryLimit: profile.categoryLimit,
          });
          this.updateUserInList(profile);
          this.profileSuccessMessage = 'User profile updated.';
          this.cdr.markForCheck();
        },
        error: () => {
          this.profileErrorMessage = 'Unable to save changes. Please retry.';
          this.cdr.markForCheck();
        },
      });
  }

  confirmResetPassword(): void {
    if (!this.selectedUserProfile || this.isResetLoading) {
      return;
    }

    this.profileErrorMessage = '';
    this.profileSuccessMessage = '';
    this.isResetLoading = true;
    this.cdr.markForCheck();

    this.usersService
      .resetUserPassword(this.selectedUserProfile.id)
      .pipe(
        take(1),
        finalize(() => {
          this.isResetLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.isResetConfirmOpen = false;
          this.profileSuccessMessage = 'Temporary password generated and emailed.';
          this.cdr.markForCheck();
        },
        error: () => {
          this.profileErrorMessage = 'Unable to reset password.';
          this.cdr.markForCheck();
        },
      });
  }

  confirmForceLogout(): void {
    if (!this.selectedUserProfile || this.isForceLogoutLoading) {
      return;
    }

    this.profileErrorMessage = '';
    this.profileSuccessMessage = '';
    this.isForceLogoutLoading = true;
    this.cdr.markForCheck();

    this.usersService
      .forceLogoutUser(this.selectedUserProfile.id)
      .pipe(
        take(1),
        finalize(() => {
          this.isForceLogoutLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.isForceLogoutConfirmOpen = false;
          this.profileSuccessMessage = 'All active tokens invalidated for this user.';
          this.cdr.markForCheck();
        },
        error: () => {
          this.profileErrorMessage = 'Unable to force logout user.';
          this.cdr.markForCheck();
        },
      });
  }

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

  get totalPages(): number {
    if (this.filteredUsers.length === 0) {
      return 1;
    }
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  get showPagination(): boolean {
    return this.filteredUsers.length > this.pageSize;
  }

  get showingStart(): number {
    if (this.filteredUsers.length === 0) {
      return 0;
    }
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredUsers.length);
  }

  get visiblePages(): number[] {
    const maxVisible = 3;
    const total = this.totalPages;
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, idx) => idx + 1);
    }

    let start = Math.max(1, this.currentPage - 1);
    let end = start + maxVisible - 1;

    if (end > total) {
      end = total;
      start = end - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
  }

  statusClass(status: UserStatus): string {
    switch (status) {
      case 'ACTIVE':
        return 'text-[#10d39f]';
      case 'INACTIVE':
        return 'text-[#9aa9bb]';
      case 'SUSPENDED':
        return 'text-[#ff5a83]';
      default:
        return 'text-[#9aa9bb]';
    }
  }

  statusDotClass(status: UserStatus): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-[#10d39f]';
      case 'INACTIVE':
        return 'bg-[#9aa9bb]';
      case 'SUSPENDED':
        return 'bg-[#ff5a83]';
      default:
        return 'bg-[#9aa9bb]';
    }
  }

  trackByUserId(_: number, user: AdminUser): string {
    return user.id;
  }

  trackByActivityIndex(index: number): number {
    return index;
  }

  private loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.usersService
      .getUsers()
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (data) => {
          this.allUsers = data.users;
          this.currentPage = 1;
          this.applyFilters();
        },
        error: () => {
          this.allUsers = [];
          this.filteredUsers = [];
          this.pagedUsers = [];
          this.errorMessage = 'Unable to load users. Please retry.';
          this.cdr.markForCheck();
        },
      });
  }

  private applyFilters(): void {
    const filter = this.filterForm.getRawValue();
    const name = filter.name.trim().toLowerCase();
    const email = filter.email.trim().toLowerCase();
    const userId = filter.userId.trim().toLowerCase();

    this.filteredUsers = this.allUsers.filter((user) => {
      const matchesName = !name || user.name.toLowerCase().includes(name);
      const matchesEmail = !email || user.email.toLowerCase().includes(email);
      const matchesUserId = !userId || user.id.toLowerCase().includes(userId);
      const matchesStatus = filter.status === 'ALL' || user.status === filter.status;

      return matchesName && matchesEmail && matchesUserId && matchesStatus;
    });

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    this.updatePagedUsers();
  }

  private updatePagedUsers(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedUsers = this.filteredUsers.slice(start, start + this.pageSize);
    this.cdr.markForCheck();
  }

  private loadUserActivity(userId: string): void {
    this.usersService
      .getUserActivity(userId)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.selectedUserActivity = response.activity ?? [];
          this.cdr.markForCheck();
        },
        error: () => {
          this.selectedUserActivity = [];
          this.cdr.markForCheck();
        },
      });
  }

  private updateUserInList(profile: AdminUserProfile): void {
    const updateFn = (user: AdminUser): AdminUser =>
      user.id === profile.id
        ? {
            ...user,
            email: profile.email,
            status: profile.status,
          }
        : user;

    this.allUsers = this.allUsers.map(updateFn);
    this.filteredUsers = this.filteredUsers.map(updateFn);
    this.updatePagedUsers();
  }
}
