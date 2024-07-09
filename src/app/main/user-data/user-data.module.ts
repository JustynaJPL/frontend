import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { LogUserComponent } from '../../login/log-user/log-user.component';
import { MyDataComponent } from './my-data/my-data.component';

const routes: Routes = [
  {   path: '',   component: MyDataComponent }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule, RouterModule.forChild(routes), ReactiveFormsModule
  ]
})
export class UserDataModule { }
