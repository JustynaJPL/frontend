import { LoggerService } from './logger.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LogUserComponent } from './log-user/log-user.component';
import { AuthGuardService } from '../auth-guard.service';
import { AuthService } from '../auth.service';

const routes: Routes = [
  {   path: '',   component: LogUserComponent}
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule, RouterModule.forChild(routes)
  ],
  providers:[LoggerService, AuthGuardService, AuthService]
})
export class LoginModule { }
