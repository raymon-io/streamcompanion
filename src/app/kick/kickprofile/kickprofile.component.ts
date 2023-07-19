import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';

import { Kickinterface } from '../interfaces/kickinterface';
import { KickService } from '../services/kick.service';

@Component({
  selector: 'app-kickprofile',
  templateUrl: './kickprofile.component.html',
  styleUrls: ['./kickprofile.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class KickprofileComponent  implements OnInit {

  // 'streamer' input
  @Input() streamer!: Kickinterface;

  moreoptions: boolean = false;


  // functions

  constructor(
    public kickService: KickService,
    private toastController: ToastController
  ) { }

  ngOnInit() { }

  async copyToClipboard(url: string) {
    await navigator.clipboard.writeText(url);
    const toast = await this.toastController.create({
      message: 'Copied to clipboard',
      duration: 2000
    });
    toast.present();
  }

}
