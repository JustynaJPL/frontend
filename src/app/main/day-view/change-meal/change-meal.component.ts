import { Component } from '@angular/core';
import { AppNaviComponent } from "../../../app-navi/app-navi.component";
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-change-meal',
    standalone: true,
    templateUrl: './change-meal.component.html',
    styleUrl: './change-meal.component.sass',
    imports: [
      CommonModule,
      MatCardModule,
      AppNaviComponent
    ]
})
export class ChangeMealComponent {
  constructor(private route:ActivatedRoute){
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      let mode = 'edit';
      if(params['mode'] != null){
        mode = params['mode'];
      }
      console.log(id, mode);
    });
  }

}
