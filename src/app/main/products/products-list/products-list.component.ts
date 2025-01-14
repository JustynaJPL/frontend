import { Component } from '@angular/core';
import { AppNaviComponent } from "../../../app-navi/app-navi.component";

@Component({
    selector: 'app-products-list',
    standalone: true,
    templateUrl: './products-list.component.html',
    styleUrl: './products-list.component.sass',
    imports: [AppNaviComponent]
})
export class ProductsListComponent {

}
