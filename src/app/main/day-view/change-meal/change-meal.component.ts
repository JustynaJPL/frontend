import { Component } from '@angular/core';
import { AppNaviComponent } from "../../../app-navi/app-navi.component";
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

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

}
