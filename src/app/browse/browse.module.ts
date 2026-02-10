import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NlnaviComponent } from './nlnavi/nlnavi.component';

const routes: Routes = [
  {
    path: '',
    component: NlnaviComponent,
    children: [
      {
        path: 'nlrecipes',
        loadChildren: () =>
          import('./nlrecipes/nlrecipes.module').then(m => m.NlrecipesModule)
      },
      {
        path: 'nlproducts',
        loadChildren: () =>
          import('./nlproducts/nlproducts.module').then(m => m.NlproductsModule)
      },
      { path: '', redirectTo: 'nlrecipes', pathMatch: 'full' }
    ]
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
