import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminDashboardMatch: CanMatchFn = () => {
  const auth = inject(AuthService);

  return auth.isAuthenticated() && auth.isAdmin();
};

export const userDashboardMatch: CanMatchFn = () => {
  const auth = inject(AuthService);

  if (!auth.isAuthenticated() || auth.isAdmin()) {
    return false;
  }

  const role = auth.user()?.role;
  const roles = Array.isArray(role) ? role : [role];

  return roles.some((value) => value === 'USER' || value === 'ROLE_USER');
};
