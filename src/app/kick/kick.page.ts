import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { Kickinterface } from './interfaces/kickinterface';
import { KickService } from './services/kick.service';

@Component({
  selector: 'app-kick',
  templateUrl: './kick.page.html',
  styleUrls: ['./kick.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class KickPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
