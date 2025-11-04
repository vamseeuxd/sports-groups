import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/landing-page/landing-page').then(c => c.LandingPage)
    },
    {
        path: 'groups',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/manage-group/manage-group').then(c => c.ManageGroup)
    },
    {
        path: 'manage-tournaments/:groupId',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/manage-tournaments/manage-tournaments').then(c => c.ManageTournaments)
    },
    {
        path: 'player-registration',
        loadComponent: () => import('./pages/player-registration/player-registration').then(c => c.PlayerRegistration)
    },
    {
        path: 'tournament-config/:groupId/:tournamentId/:activeTab',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/tournament-config/tournament-config').then(c => c.TournamentConfig)
    },
    {
        path: 'tournament-knockout/:groupId/:tournamentId',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/tournament-knockout/tournament-knockout').then(c => c.TournamentKnockout)
    },
    {
        path: 'copy-demo',
        loadComponent: () => import('./pages/copy-demo/copy-demo').then(c => c.CopyDemo)
    },
];
