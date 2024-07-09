import { Component, inject } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrl: './dash.component.css',
  standalone: true,
  imports: [
    AsyncPipe,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class DashComponent {
  private breakpointObserver = inject(BreakpointObserver);

  Cardsmobile = [
    { title: 'Card 1', cols: 1, rows: 2, comp: '<app-add-meal></app-add-meal>'},
    { title: 'Card 2', cols: 1, rows: 1, comp: '<app-add-meal></app-add-meal>'},
    { title: 'Card 3', cols: 1, rows: 1, comp: '<app-add-meal></app-add-meal>'}
  ];

  Cardsnormal = [
    { title: 'Card 1', cols: 1, rows: 3,comp: '<app-add-meal></app-add-meal>' },
    { title: 'Card 2', cols: 1, rows: 2, comp: '<app-add-meal></app-add-meal>' },
    { title: 'Card 3', cols: 1, rows: 1, comp: '<app-add-meal></app-add-meal>' }
  ];

  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return this.Cardsmobile
      }
      return this.Cardsnormal
    })
  );
}
