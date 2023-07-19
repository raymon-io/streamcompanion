import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-kickwatch',
  templateUrl: './kickwatch.page.html',
  styleUrls: ['./kickwatch.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class KickwatchPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
