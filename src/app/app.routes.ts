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
  {
    path: 'privacy',
    loadComponent: () => import('./privacy/privacy.page').then( m => m.PrivacyPage)
  },
  {
    path: 'kick/:streamerSlug/videos',
    loadComponent: () => import('./kick/videos/videos.page').then( m => m.VideosPage)
  },
  {
    path: 'kick/:streamerSlug/chat',
    loadComponent: () => import('./kick/kickwatch/popout-chat/popout-chat.page').then( m => m.PopoutChatPage)
  },
];
