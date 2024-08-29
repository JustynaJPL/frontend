import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthGuard } from '../auth-guard.service'; // Import AuthGuard

const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./day-view/day-view.module').then(m => m.DayViewModule),
    canActivate: [AuthGuard] // Zabezpieczenie trasy
  },
  {
    path: 'my-data',
    loadChildren: () => import('./user-data/user-data.module').then(m => m.UserDataModule),
    canActivate: [AuthGuard] // Zabezpieczenie trasy
  },
  {
    path: 'recipes',
    loadChildren: () => import('./recipes/recipes.module').then(m => m.RecipesModule),
    canActivate: [AuthGuard] // Zabezpieczenie trasy
  },
  {
    path: 'plan',
    loadChildren: () => import('./current-plan/current-plan.module').then(m => m.CurrentPlanModule),
    canActivate: [AuthGuard] // Zabezpieczenie trasy
  },
  {
    path: 'generate',
    loadChildren: () => import('./generate-plan/generate-plan.module').then(m => m.GeneratePlanModule),
    canActivate: [AuthGuard] // Zabezpieczenie trasy
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule
  ],
  exports: [RouterModule]
})
export class MainModule { }
