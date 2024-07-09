import { Component } from '@angular/core';
import { AppNaviComponent } from "../../../app-navi/app-navi.component";
import { DashComponent } from "../dash/dash.component";

@Component({
    selector: 'app-today',
    standalone: true,
    templateUrl: './today.component.html',
    styleUrl: './today.component.sass',
    imports: [AppNaviComponent, DashComponent]
})
export class TodayComponent {

}
