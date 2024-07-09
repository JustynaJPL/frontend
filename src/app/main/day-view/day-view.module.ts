import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TodayComponent } from './today/today.component';
import { AddMealComponent } from './add-meal/add-meal.component';
import { ChangeMealComponent } from './change-meal/change-meal.component';

export const routes: Routes = [
  {path:'today', component:TodayComponent},
  {path:'add-meal', component:AddMealComponent},
  {path:'change-meal', component: ChangeMealComponent},
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
