import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ViewProductComponent } from './view-product/view-product.component';

export const routes: Routes = [
  {path:'list', component:ProductListComponent},
  {path:'view/:id', component:ViewProductComponent},
  {
    path: '',
    redirectTo:'list',
    pathMatch:'full'
  }
]


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class NlproductsModule { }
