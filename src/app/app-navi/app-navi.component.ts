import { Component, HostBinding, Output, inject, EventEmitter} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule, RouterOutlet } from '@angular/router';
import { routes } from '../app.routes';
import { Router } from 'express';
import { LoggerService } from '../login/logger.service';
import { MyData } from '../models/MyData';
import { NaviUserData } from '../models/naviUserData';

@Component({
  selector: 'app-app-navi',
  templateUrl: './app-navi.component.html',
  styleUrl: './app-navi.component.css',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    MatSlideToggleModule,
    RouterModule
  ]
})
export class AppNaviComponent {
  private breakpointObserver = inject(BreakpointObserver);
  shortData:NaviUserData;



  constructor(private loger:LoggerService){
    this.shortData = {
      name:'',
      avatar:''
    };

  }

  ngOnInit(){
    this.loger.getMyData().subscribe((response:MyData)=>{
      this.shortData.name = response.name;
      this.shortData.avatar = this.loger.api + response.avatar;
    })
  }


  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

    onClick(){
      // this.router.link('../recipes');
    }



}
