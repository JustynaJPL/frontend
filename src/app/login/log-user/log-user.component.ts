import {ChangeDetectionStrategy, Component} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatChipsModule} from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-log-user',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule,
    MatCardModule, MatChipsModule, MatButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './log-user.component.html',
  styleUrl: './log-user.component.sass'
})
export class LogUserComponent {

}
