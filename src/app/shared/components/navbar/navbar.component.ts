import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  ChartNoAxesCombined,
  CircleHelp,
  LucideAngularModule,
  LucideIconData,
} from 'lucide-angular';

import {
  FileWarning,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
  Users2,
  X,
} from '../../../shared/icons/icons';
import { AuthService } from '../../../core/services/auth.service';

interface NavLink {
  path: string;
  label: string;
  icon: LucideIconData;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  readonly user = this.auth.user;
  readonly photo = this.auth.photo;

  mobileOpen = false;

  readonly MenuIcon = Menu;
  readonly CloseIcon = X;
  readonly LogOutIcon = LogOut;

  readonly links: NavLink[] = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/championships', label: 'Campeonatos', icon: Trophy },
    { path: '/games', label: 'Partidas', icon: Swords },
    { path: '/referees', label: 'Árbitros', icon: ShieldCheck },
    { path: '/teams', label: 'Times', icon: Users2 },
    { path: '/reports', label: 'Denúncias', icon: FileWarning },
    { path: '/faq', label: 'FAQ', icon: CircleHelp },

    {
      path: '/oracle-apex',
      label: 'Oracle APEX',
      icon: ChartNoAxesCombined,
      adminOnly: true,
    },
    {
      path: '/users',
      label: 'Usuários',
      icon: Users,
      adminOnly: true,
    },
  ];

  readonly visibleLinks = computed(() => {
    const currentUser = this.user();
    const isAdmin = currentUser?.role === 'ADMIN';

    return this.links.filter((link) => !link.adminOnly || isAdmin);
  });

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
    this.mobileOpen = false;
  }

  initials(): string {
    return (
      this.user()
        ?.name?.split(' ')
        .slice(0, 2)
        .map((name: string) => name[0])
        .join('')
        .toUpperCase() ?? '?'
    );
  }
}
