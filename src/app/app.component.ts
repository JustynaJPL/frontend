import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppNaviComponent } from "./app-navi/app-navi.component";
import { DashComponent } from "./dash/dash.component";

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.sass',
    imports: [RouterOutlet, AppNaviComponent, DashComponent]
})
export class AppComponent {
  title = 'frontend';
}
