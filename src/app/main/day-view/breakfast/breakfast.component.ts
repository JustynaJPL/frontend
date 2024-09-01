import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { DatabaseConnectorService } from '../../../database-services/database-connector.service';
import { CdkTableDataSourceInput } from '@angular/cdk/table';

@Component({
  selector: 'app-breakfast',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule,
  ],
  templateUrl: './breakfast.component.html',
  styleUrl: './breakfast.component.sass'
})
export class BreakfastComponent {
  displayedColumns:string[] = ['Nazwa posiłku','Waga','Kcal','Białka','Tłuszcze','Węglowodany'];
  dataSource: CdkTableDataSourceInput<any> = [];
  uid:number;

  constructor(private db:DatabaseConnectorService){
    this.uid = 0;

  }

  ngOnInit(){


  }

  onClick(){

  }

}
