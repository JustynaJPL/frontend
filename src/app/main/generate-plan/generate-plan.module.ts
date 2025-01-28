import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { GoalsComponent } from './goals/goals.component';
import { ResultsComponent } from './results/results.component';

export const routes: Routes = [
  {path:'set-goals', component:GoalsComponent},
  {path:'results', component:ResultsComponent},
  {
    path: '',
    redirectTo:'set-goals',
    pathMatch:'full'
  }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule, RouterModule.forChild(routes), ReactiveFormsModule
  ],
  exports: [RouterModule]
})
export class GeneratePlanModule { }
