import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/landing-page/landing-page').then(c => c.LandingPage)
    },
    {
        path: 'groups',
        loadComponent: () => import('./pages/manage-group/manage-group').then(c => c.ManageGroup)
    },
];
