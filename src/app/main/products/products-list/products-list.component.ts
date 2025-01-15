import { MealsService } from './../../day-view/meals.service';
import { Component } from '@angular/core';
import { AppNaviComponent } from "../../../app-navi/app-navi.component";
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { Produkt } from '../../../models/Produkt';
import { ProductsService } from '../products.service';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
    selector: 'app-products-list',
    standalone: true,
    templateUrl: './products-list.component.html',
    styleUrl: './products-list.component.sass',
    imports: [
      AppNaviComponent,
      CommonModule,
      MatTableModule
    ]
})
export class ProductsListComponent {
  datasource = new MatTableDataSource<Produkt>();
  private destroy$ = new Subject<void>();
  displayedColumns = ['nazwa', 'kcal', 'bialka', 'tluszcze','weglowodany', 'actions'];

  constructor(
    private prodService:ProductsService
  ){


  }

  ngOnInit(): void {
    this.prodService.getProducts()
          .pipe(takeUntil(this.destroy$))
          .subscribe((produkty) => {
            this.datasource.data = produkty;
            console.log(produkty);
          });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete(); // Zawsze pamiętaj o odsubskrybowaniu, aby uniknąć wycieków pamięci
  }





}
