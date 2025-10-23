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
];
