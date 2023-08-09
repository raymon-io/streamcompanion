import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';

import { Kickinterface, CastjsInterface } from '../interfaces/kickinterface';
import { KickService } from '../services/kick.service';
import { VideoAudioComponentComponent } from '../kickwatch/video-audio-component/video-audio-component.component';

declare var Castjs: any;
declare var window: any;

@Component({
  selector: 'app-kickprofile',
  templateUrl: './kickprofile.component.html',
  styleUrls: ['./kickprofile.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, VideoAudioComponentComponent]
})
export class KickprofileComponent implements OnInit {

  // 'streamer' input
  @Input() streamer!: Kickinterface;

  moreoptions: boolean = false;

  cjs: CastjsInterface | undefined;

  iosDetected: boolean = false;
  airPlayVideo: boolean = false;


  // functions

  constructor(
    public kickService: KickService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.cjs = new Castjs();
  }

  ngAfterViewInit() {
    if (!!window.WebKitPlaybackTargetAvailabilityEvent) {
      this.iosDetected = true;
    }
  }

  async copyToClipboard(url: string) {
    await navigator.clipboard.writeText(url);
    const toast = await this.toastController.create({
      message: 'Copied to clipboard',
      duration: 2000
    });
    toast.present();
  }

  openAirPlay() {
    this.airPlayVideo = true;
  }

}
