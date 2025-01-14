import { Component } from '@angular/core';
import { AppNaviComponent } from "../../../app-navi/app-navi.component";

@Component({
    selector: 'app-view-products',
    standalone: true,
    templateUrl: './view-products.component.html',
    styleUrl: './view-products.component.sass',
    imports: [AppNaviComponent]
})
export class ViewProductsComponent {

}
