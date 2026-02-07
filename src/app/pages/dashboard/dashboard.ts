import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, finalize, take } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  isSigningOut = false;
  pageTitle = 'System Dashboard';
  pageChip = 'ADMIN ACCESS';

  constructor() {
    this.updateHeaderFromUrl(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateHeaderFromUrl(event.urlAfterRedirects);
      });
  }

  onLogout(): void {
    if (this.isSigningOut) {
      return;
    }

    this.isSigningOut = true;
    this.authService
      .logout()
      .pipe(
        take(1),
        finalize(() => {
          this.isSigningOut = false;
        }),
      )
      .subscribe({
        next: () => {
          void this.router.navigate(['/login']);
        },
        error: () => {
          void this.router.navigate(['/login']);
        },
      });
  }

  private updateHeaderFromUrl(url: string): void {
    if (url.includes('/dashboard/users')) {
      this.pageTitle = 'User Management';
      this.pageChip = '/admin/users';
      return;
    }

    if (url.includes('/dashboard/currencies')) {
      this.pageTitle = 'Currencies';
      this.pageChip = '/admin/currencies';
      return;
    }

    if (url.includes('/dashboard/categories')) {
      this.pageTitle = 'Categories';
      this.pageChip = '/admin/categories';
      return;
    }

    if (url.includes('/dashboard/system')) {
      this.pageTitle = 'System';
      this.pageChip = '/admin/system';
      return;
    }

    this.pageTitle = 'System Dashboard';
    this.pageChip = 'ADMIN ACCESS';
  }
}
