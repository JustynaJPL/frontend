import { RecipesModule } from './recipes/recipes.module';
import { UserDataModule } from './user-data/user-data.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  {   path: 'dashboard', loadChildren: () => import('./day-view/day-view.module').then(m => m.DayViewModule)},
  {   path: 'my-data', loadChildren: () => import('./user-data/user-data.module').then(m => m.UserDataModule)},
  {   path: 'recipes', loadChildren: () => import('./recipes/recipes.module').then(m => m.RecipesModule)},
  {   path: 'plan', loadChildren: () => import('./current-plan/current-plan.module').then(m => m.CurrentPlanModule)},
  {   path: 'generate', loadChildren: () => import('./generate-plan/generate-plan.module').then(m => m.GeneratePlanModule)},
  {
    path: '',
    redirectTo:'dashboard',
    pathMatch:'full'
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule, RouterModule.forChild(routes), ReactiveFormsModule, RouterModule, RouterOutlet
  ]
})
export class MainModule { }


// ,canActivate:AuthGuardService
