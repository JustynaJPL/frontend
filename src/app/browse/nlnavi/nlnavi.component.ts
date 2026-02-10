import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nlnavi',
  standalone: true,
  imports: [RouterModule, MatIcon, MatButtonModule],
  templateUrl: './nlnavi.component.html',
  styleUrl: './nlnavi.component.sass'
})
export class NlnaviComponent {

}
