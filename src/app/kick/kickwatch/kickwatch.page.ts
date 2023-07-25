import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { KickService } from '../services/kick.service';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { ActivatedRoute } from '@angular/router';
import { KickChatComponent } from './kick-chat/kick-chat.component';

// import {VideoJsPlayerOptions} from 'video.js';
// import videojs from 'video.js';

@Component({
  selector: 'app-kickwatch',
  templateUrl: './kickwatch.page.html',
  styleUrls: ['./kickwatch.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, VideoPlayerComponent, KickChatComponent]
})
export class KickwatchPage implements OnInit {
  // variables
  @Input() streamerName!: string | undefined;

  options = {
    autoplay: true,
    controls: true,
    sources: [
      {
        src: this.kickService.streamUrl(),
        type: 'application/x-mpegURL'
      }
    ],
    fill: true,
    techOrder: ['AmazonIVS','chromecast','html5'],
    // html5: {
    //   nativeTextTracks: false,
    //   nativeAudioTracks: false,
    //   vhs: {
    //     overrideNative: true,
    //   },
    // },
    // liveui: true,
    controlBar: {
      currentTimeDisplay: true,
      durationDisplay: true,
      remainingTimeDisplay: true,
      fullscreenToggle: true,
      seekToLive: true,
      volumePanel: {
        inline: false,
      },
      progressControl: {
        seekBar: true,
      },
    },
  };



  constructor(
    public kickService: KickService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    // console.log('kickwatch init');
    this.streamerName = this.route.snapshot.paramMap.get('streamerName') as string;
    this.updateSignal();
  }

  updateSignal() {
    // if url is manually typed get the api info
    if (this.kickService.signalStreamer() == null) {
      this.updateUrl();
    } else {
      // this.url = 'https://corsproxy.io/?' + this.kickService.signalStreamer()?.playback_url;
      this.kickService.streamUrl.set('https://corsproxy.io/?' + this.kickService.signalStreamer()?.playback_url);
      // console.log(this.url);
      // console.log('updateSignal');
      // console.log(this.kickService.streamUrl());
    }
  }

  async updateUrl() {
    const streamer = await this.kickService.getApi(this.streamerName as string);
    if (streamer == null) {
      console.log("streamer not found");
    } else if (streamer != null && streamer != undefined) {
      this.kickService.signalStreamer.set(streamer);
      // console.log("streamer found and set");
      if (streamer.livestream?.is_live == true) {
        // this.url = 'https://corsproxy.io/?' + streamer.playback_url;
        this.kickService.streamUrl.set('https://corsproxy.io/?' + streamer.playback_url);
        // this.kickService.streamUrl.set(streamer.playback_url);
        // console.log("streamer is live");
        // console.log(this.url);
        // console.log(this.kickService.streamUrl());
      }
      else {
        console.log("streamer is not live");
      }
    }
  }

}
