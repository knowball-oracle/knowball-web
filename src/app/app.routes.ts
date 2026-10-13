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
        title: 'Entrar',
        loadComponent: () =>
          import('./features/auth/login/login-component').then((c) => c.LoginComponent),
      },
      {
        path: 'register',
        title: 'Criar conta',
        loadComponent: () =>
          import('./features/auth/register/register-component').then((c) => c.RegisterComponent),
      },
      {
        path: 'callback',
        title: 'Autenticando',
        loadComponent: () =>
          import('./features/auth/callback/auth-callback-component').then(
            (c) => c.AuthCallbackComponent,
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
        title: 'Dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((c) => c.DashboardComponent),
      },

      {
        path: 'championships',
        children: [
          {
            path: '',
            title: 'Campeonatos',
            loadComponent: () =>
              import('./features/championship/championship-list/championship-list.component').then(
                (c) => c.ChampionshipListComponent,
              ),
          },
          {
            path: 'new',
            title: 'Novo campeonato',
            loadComponent: () =>
              import('./features/championship/championship-form/championship-form.component').then(
                (c) => c.ChampionshipFormComponent,
              ),
            canActivate: [AdminGuard],
          },
          {
            path: ':id/edit',
            title: 'Editar campeonato',
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
            title: 'Partidas',
            loadComponent: () =>
              import('./features/game/game-list/game-list.component').then(
                (c) => c.GameListComponent,
              ),
          },
          {
            path: 'new',
            title: 'Nova partida',
            loadComponent: () =>
              import('./features/game/game-form/game-form.component').then(
                (c) => c.GameFormComponent,
              ),
            canActivate: [AdminGuard],
          },
          {
            path: ':id',
            title: 'Detalhes da partida',
            loadComponent: () =>
              import('./features/game/game-detail/game-detail.component').then(
                (c) => c.GameDetailComponent,
              ),
          },
          {
            path: ':id/edit',
            title: 'Editar partida',
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
            title: 'Árbitros',
            loadComponent: () =>
              import('./features/referee/referee-list/referee-list.component').then(
                (c) => c.RefereeListComponent,
              ),
          },
          {
            path: 'new',
            title: 'Novo árbitro',
            loadComponent: () =>
              import('./features/referee/referee-form/referee-form.component').then(
                (c) => c.RefereeFormComponent,
              ),
            canActivate: [AdminGuard],
          },
          {
            path: ':id/edit',
            title: 'Editar árbitro',
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
            title: 'Times',
            loadComponent: () =>
              import('./features/team/team-list/team-list.component').then(
                (c) => c.TeamListComponent,
              ),
          },
          {
            path: 'new',
            title: 'Novo time',
            loadComponent: () =>
              import('./features/team/team-form/team-form.component').then(
                (c) => c.TeamFormComponent,
              ),
            canActivate: [AdminGuard],
          },
          {
            path: ':id/edit',
            title: 'Editar time',
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
            title: 'Denúncias',
            loadComponent: () =>
              import('./features/report/report-list/report-list.component').then(
                (c) => c.ReportListComponent,
              ),
          },
          {
            path: 'new',
            title: 'Nova denúncia',
            loadComponent: () =>
              import('./features/report/report-form/report-form.component').then(
                (c) => c.ReportFormComponent,
              ),
            canActivate: [UserOnlyGuard],
          },
          {
            path: ':id',
            title: 'Detalhes da denúncia',
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
            title: 'Usuários',
            loadComponent: () =>
              import('./features/user/user-list/user-list.component').then(
                (c) => c.UserListComponent,
              ),
          },
          {
            path: 'new',
            title: 'Novo usuário',
            loadComponent: () =>
              import('./features/user/user-form/user-form.component').then(
                (c) => c.UserFormComponent,
              ),
          },
          {
            path: ':id/edit',
            title: 'Editar usuário',
            loadComponent: () =>
              import('./features/user/user-form/user-form.component').then(
                (c) => c.UserFormComponent,
              ),
          },
        ],
      },

      {
        path: 'oracle-apex',
        title: 'Oracle APEX',
        canActivate: [AdminGuard],
        loadComponent: () =>
          import('./features/oracle-apex/oracle-apex.component').then((c) => c.OracleApexComponent),
      },
      {
        path: 'faq',
        title: 'FAQ',
        loadComponent: () => import('./features/faq/faq.component').then((m) => m.FaqComponent),
      },
      {
        path: 'profile',
        title: 'Meu perfil',
        loadComponent: () =>
          import('./shared/components/update-profile/update-profile.component').then(
            (c) => c.UpdateProfileComponent,
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
