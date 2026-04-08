import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  LayoutDashboard,
  Trophy,
  Swords,
  ShieldCheck,
  Users2,
  FileWarning,
  Users,
  LogOut,
  Menu,
  X,
} from '../../../shared/icons/icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private router = inject(Router);
  auth = inject(AuthService);

  user = this.auth.getUser();
  mobileOpen = false;

  readonly MenuIcon = Menu;
  readonly CloseIcon = X;
  readonly LogOutIcon = LogOut;

  links = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/championships', label: 'Campeonatos', icon: Trophy },
    { path: '/games', label: 'Partidas', icon: Swords },
    { path: '/referees', label: 'Árbitros', icon: ShieldCheck },
    { path: '/teams', label: 'Times', icon: Users2 },
    { path: '/reports', label: 'Denúncias', icon: FileWarning },
    { path: '/users', label: 'Usuários', icon: Users },
  ];

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
    this.mobileOpen = false;
  }

  initials(): string {
    return (
      this.user?.name
        ?.split(' ')
        .slice(0, 2)
        .map((n: any[]) => n[0])
        .join('')
        .toUpperCase() ?? '?'
    );
  }
}
