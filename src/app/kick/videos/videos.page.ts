import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { CastjsInterface, KickVideoInterface } from '../interfaces/kickinterface';
import { VideoAudioComponentComponent } from '../kickwatch/video-audio-component/video-audio-component.component';

declare var Castjs: any;
declare var window: any;

@Component({
  selector: 'app-videos',
  templateUrl: './videos.page.html',
  styleUrls: ['./videos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, VideoAudioComponentComponent]
})
export class VideosPage implements OnInit {
  // variables
  @Input() streamerSlug!: string;

  videos: KickVideoInterface[] = [];
  selectedQuality = 'auto';

  cjs: any;
  manifestToDownload: string = '';

  iosDetected: boolean = false;
  airPlayVideo: boolean = false;
  airPlayVideoUrl: string = '';

  noVideos: boolean = false;


  // functions
  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    // console.log(this.streamerSlug);
    // this.cjs = new Castjs();
    this.streamerSlug = this.route.snapshot.paramMap.get('streamerSlug') as string;
    this.getVideos();
    // console.log(this.streamerSlug);
  }

  ngAfterViewInit() {
    if (!!window.WebKitPlaybackTargetAvailabilityEvent) {
      this.iosDetected = true;
    } else {
      this.cjs = new Castjs();
    }
  }


  async getVideos() {
    const url = 'https://kick.com/api/v2/channels/' + this.streamerSlug + '/videos';
    const response = await fetch(url);
    this.videos = await response.json();
    // check if no videos
    if (this.videos.length == 0) {
      this.noVideos = true;
    }

    for (let i of this.videos) {
      i.durationString = this.getTime(i.duration);
      i.videoQualities = {
        src1080p60: '',
        src720p60: '',
        src480p30: '',
        src360p30: '',
        src160p30: '',
      };
      i.videoQualities!.src1080p60 = i.source.replace("master.m3u8", "1080p60/playlist.m3u8");
      i.videoQualities!.src720p60 = i.source.replace("master.m3u8", "720p60/playlist.m3u8");
      i.videoQualities!.src480p30 = i.source.replace("master.m3u8", "480p30/playlist.m3u8");
      i.videoQualities!.src360p30 = i.source.replace("master.m3u8", "360p30/playlist.m3u8");
      i.videoQualities!.src160p30 = i.source.replace("master.m3u8", "160p30/playlist.m3u8");
    }

  }

  getTime(msTime: number) {
    // ms to total amount of hours, seconds and minutes
    const hours = Math.floor(msTime / 3600000);
    const minutes = Math.floor((msTime % 3600000) / 60000);
    const seconds = Math.floor(((msTime % 360000) % 60000) / 1000);
    // console.log(hours, minutes, seconds);
    const durationTime = hours + ':' + minutes + ':' + seconds;
    return durationTime;
  }

  castVideo(item: KickVideoInterface) {
    // Implement Chromecast functionality here.
    let videoUrl = '';
    if (this.selectedQuality == 'auto') {
      videoUrl = item.source;
    } else if (this.selectedQuality == 'src1080p60') {
      videoUrl = item.videoQualities!.src1080p60;
    } else if (this.selectedQuality == 'src720p60') {
      videoUrl = item.videoQualities!.src720p60;
    } else if (this.selectedQuality == 'src480p30') {
      videoUrl = item.videoQualities!.src480p30;
    } else if (this.selectedQuality == 'src360p30') {
      videoUrl = item.videoQualities!.src360p30;
    } else if (this.selectedQuality == 'src160p30') {
      videoUrl = item.videoQualities!.src160p30;
    }
    console.log(videoUrl);
    this.cjs?.cast('https://proxy-jrcrz65weq-uc.a.run.app/' + videoUrl);

  }

  // watchVideo(item: KickVideoInterface) {
  // }

  async downloadVideo(item: KickVideoInterface) {
    const masterUrl = item.source;
    const baseUrl = masterUrl.replace('/master.m3u8', '/');
    const proxyMasterUrl = 'https://proxy-jrcrz65weq-uc.a.run.app/' + masterUrl;
    const response = await fetch(proxyMasterUrl);
    const manifest = await response.text();
    let finalManifest = '';
    finalManifest = manifest.replace(/(\d+p\d+\/playlist\.m3u8)/g, match => {
      return baseUrl + match;
    });
    if (this.selectedQuality == 'auto') {
      this.manifestToDownload = finalManifest;
    } else {
      const quality = this.selectedQuality.replace('src', '');
      // console.log(quality);
      const qualityUrlBaseUrl = baseUrl + quality;
      const qualityUrl = qualityUrlBaseUrl + '/playlist.m3u8';
      const proxyQualityUrl = 'https://proxy-jrcrz65weq-uc.a.run.app/' + qualityUrl;
      const qualityResponse = await fetch(proxyQualityUrl);
      const qualityManifest = await qualityResponse.text();
      this.manifestToDownload = qualityManifest.replace(/(\d+\.ts)/g, match => {
        return qualityUrlBaseUrl + '/' + match;
      });

    }
    const blob = new Blob([this.manifestToDownload], { type: 'application/x-mpegURL' });
    const manifestUrlToDownload = URL.createObjectURL(blob);
    // download it
    const a = document.createElement('a');
    a.href = manifestUrlToDownload;
    a.download = this.selectedQuality == 'auto' ? this.streamerSlug + '_' + item.start_time + '_master.m3u8' : item.start_time + '_' + this.selectedQuality.replace('src', '') + '.m3u8';
    document.body.appendChild(a);
    a.click();
  }

  async modifyManifestMaster() {

  }

  async modifyManifest(item: KickVideoInterface) {
    const masterUrl = item.source;
    const baseUrl = masterUrl.replace('/master.m3u8', '/');
    const proxyMasterUrl = 'https://proxy-jrcrz65weq-uc.a.run.app/' + masterUrl;
    if (this.selectedQuality == 'auto') {
      const response = await fetch(proxyMasterUrl);
      const manifest = await response.text();
      return manifest.replace(/(\d+p\d+\/playlist\.m3u8)/g, match => {
        // return baseUrl + match;
        console.log('auto');
        console.log(baseUrl + match);
        return baseUrl + match;
      });
    } else {
      // return masterUrl.replace('master.m3u8', this.selectedQuality);
      console.log(masterUrl.replace('master.m3u8', this.selectedQuality));
      return masterUrl.replace('master.m3u8', this.selectedQuality);
    }
  }

  openAirPlay(_airPlayVideoUrl: string) {
    this.airPlayVideo = true;
    this.airPlayVideoUrl = _airPlayVideoUrl;
  }


}
