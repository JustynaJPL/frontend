import { BrowseModule } from './browse/browse.module';
import { Routes } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth-guard.service';

export const routes: Routes = [
  {
    path:'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
  },
  {
    path:'logged',
    loadChildren: () => import('./main/main.module').then(m => m.MainModule),
    canActivate: [AuthGuard]
  },
  {
    path:'browse',
    loadChildren: () => import('./browse/browse.module').then(m => m.BrowseModule),
    canActivate: []
  },
  {
    path: '',
    redirectTo:'login',
    pathMatch:'full'
  }
];
