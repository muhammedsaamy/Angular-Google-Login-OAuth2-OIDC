import { Component } from '@angular/core';
import { GoogleApiService } from './core/services/google-api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'MyApp';
  /**
   *
   */
  constructor(private readonly googleApi: GoogleApiService) {

  }
}
