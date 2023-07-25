import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class AppComponent {
  constructor(
    // private platform: Platform
  ) {
    // this.initializeApp();
  }

  // initializeApp() {
  //   const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  //   document.body.classList.toggle('dark',true);
  //   console.log('prefersDark',prefersDark);
  // }
}
