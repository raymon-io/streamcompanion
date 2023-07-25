import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';

import { Kickinterface, CastjsInterface } from '../interfaces/kickinterface';
import { KickService } from '../services/kick.service';

declare var Castjs: any;
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

  cjs: CastjsInterface | undefined;


  // functions

  constructor(
    public kickService: KickService,
    private toastController: ToastController
  ) { }

  ngOnInit() { 
    this.cjs = new Castjs();
  }

  async copyToClipboard(url: string) {
    await navigator.clipboard.writeText(url);
    const toast = await this.toastController.create({
      message: 'Copied to clipboard',
      duration: 2000
    });
    toast.present();
  }

}
