import { Component, HostBinding } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppNaviComponent } from "./app-navi/app-navi.component";
import { DashComponent } from "./dash/dash.component";
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.sass',
    imports: [RouterOutlet, AppNaviComponent, DashComponent, MatSlideToggleModule,
      MatSidenavModule
    ]
})
export class AppComponent {

  title = 'frontend';

}
