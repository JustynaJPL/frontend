import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: 'nlrecipes',
    loadChildren: () => import('./nlrecipes/nlrecipes.module').then(m => m.NlrecipesModule),
    canActivate: [] // Zabezpieczenie trasy
  },
  {
    path: 'nlproducts',
    loadChildren: () => import('./nlproducts/nlproducts.module').then(m => m.NlproductsModule),
    canActivate: [] // Zabezpieczenie trasy
  },
  {
    path: '',
    redirectTo: 'nlrecipes',
    pathMatch: 'full',
  }
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule
  ]
})
export class BrowseModule { }
