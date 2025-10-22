import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./landing-page/landing-page').then(c => c.LandingPage)
    },
    {
        path: 'groups',
        loadComponent: () => import('./manage-group/manage-group').then(c => c.ManageGroup)
    },
];
