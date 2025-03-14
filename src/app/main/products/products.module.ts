import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsListComponent } from './products-list/products-list.component';
import { EditProductsComponent } from './edit-products/edit-products.component';
import { NewProductsComponent } from './new-products/new-products.component';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

export const routes: Routes = [
  {path:'list', component:ProductsListComponent},
  {path:':mode/:id', component:EditProductsComponent},
  {path:'new', component:NewProductsComponent},
  {
    path: '',
    redirectTo:'list',
    pathMatch:'full'
  }
]

@NgModule({
  declarations: [],
  imports: [
     CommonModule, RouterModule.forChild(routes), ReactiveFormsModule
  ],
  exports:[RouterModule]
})
export class ProductsModule { }
