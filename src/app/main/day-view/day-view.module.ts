import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AddMealComponent } from './add-meal/add-meal.component';
import { ChangeMealComponent } from './change-meal/change-meal.component';
import { DashComponent } from './dash/dash.component';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';

export const routes: Routes = [
  {path:'today', component:DashComponent},
  {path:'add-meal/:id', component:AddMealComponent},
  {path:'change-meal/:id/:mode', component: ChangeMealComponent},
  {path:'shopping-list', component:ShoppingListComponent},
  {
    path: '',
    redirectTo:'today',
    pathMatch:'full'
  }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule, RouterModule.forChild(routes), ReactiveFormsModule
  ]
})
export class DayViewModule { }
