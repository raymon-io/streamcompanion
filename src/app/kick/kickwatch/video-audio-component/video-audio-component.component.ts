import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import videojs from 'video.js';

@Component({
  selector: 'app-video-audio-component',
  templateUrl: './video-audio-component.component.html',
  styleUrls: ['./video-audio-component.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class VideoAudioComponentComponent  implements OnInit {


  @Input() videoSrc!: string;

  @ViewChild('target', { static: true }) target!: any;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.onAirPlayRequested();
    }, 3000);
  }

  onAirPlayRequested() {
    const mediaEl: any = this.target.nativeElement;

    if (mediaEl && mediaEl.webkitShowPlaybackTargetPicker) {
      mediaEl.webkitShowPlaybackTargetPicker();
    }
  }

}
