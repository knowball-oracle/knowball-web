import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { UserOnlyGuard } from './core/guards/user-only.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login-component').then((c) => c.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register-component').then((c) => c.RegisterComponent),
      },
      {
        path: 'verify-email',
        loadComponent: () =>
          import('./features/auth/verify-email/verify-email.component').then(
            (c) => c.VerifyEmailComponent,
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((c) => c.DashboardComponent),
      },

      {
        path: 'championships',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/championship/championship-list/championship-list.component').then(
                (c) => c.ChampionshipListComponent,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/championship/championship-form/championship-form.component').then(
                (c) => c.ChampionshipFormComponent,
              ),
            canActivate: [AdminGuard],
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/championship/championship-form/championship-form.component').then(
                (c) => c.ChampionshipFormComponent,
              ),
            canActivate: [AdminGuard],
          },
        ],
      },

      {
        path: 'games',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/game/game-list/game-list.component').then(
                (c) => c.GameListComponent,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/game/game-form/game-form.component').then(
                (c) => c.GameFormComponent,
              ),
            canActivate: [AdminGuard],
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/game/game-detail/game-detail.component').then(
                (c) => c.GameDetailComponent,
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/game/game-form/game-form.component').then(
                (c) => c.GameFormComponent,
              ),
            canActivate: [AdminGuard],
          },
        ],
      },

      {
        path: 'referees',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/referee/referee-list/referee-list.component').then(
                (c) => c.RefereeListComponent,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/referee/referee-form/referee-form.component').then(
                (c) => c.RefereeFormComponent,
              ),
            canActivate: [AdminGuard],
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/referee/referee-form/referee-form.component').then(
                (c) => c.RefereeFormComponent,
              ),
            canActivate: [AdminGuard],
          },
        ],
      },

      {
        path: 'teams',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/team/team-list/team-list.component').then(
                (c) => c.TeamListComponent,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/team/team-form/team-form.component').then(
                (c) => c.TeamFormComponent,
              ),
            canActivate: [AdminGuard],
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/team/team-form/team-form.component').then(
                (c) => c.TeamFormComponent,
              ),
            canActivate: [AdminGuard],
          },
        ],
      },

      {
        path: 'reports',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/report/report-list/report-list.component').then(
                (c) => c.ReportListComponent,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/report/report-form/report-form.component').then(
                (c) => c.ReportFormComponent,
              ),
            canActivate: [UserOnlyGuard],
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/report/report-detail/report-detail.component').then(
                (c) => c.ReportDetailComponent,
              ),
          },
        ],
      },

      {
        path: 'users',
        canActivate: [AdminGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/user/user-list/user-list.component').then(
                (c) => c.UserListComponent,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/user/user-form/user-form.component').then(
                (c) => c.UserFormComponent,
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/user/user-form/user-form.component').then(
                (c) => c.UserFormComponent,
              ),
          },
        ],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./shared/components/update-profile/update-profile.component').then(
            (c) => c.UpdateProfileComponent,
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
