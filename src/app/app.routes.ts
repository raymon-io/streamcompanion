import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'kick',
    loadComponent: () => import('./kick/kick.page').then( m => m.KickPage)
  },
  {
    path: 'kick/:streamerName',
    loadComponent: () => import('./kick/kickwatch/kickwatch.page').then( m => m.KickwatchPage)
  },
  // {
  //   path: '',
  //   redirectTo: '',
  //   pathMatch: 'full',
  // },
];
