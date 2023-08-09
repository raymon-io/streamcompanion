import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { KickService } from '../../services/kick.service';

import videojs from 'video.js';
// @ts-ignore
import chromecast from '@silvermine/videojs-chromecast';
// @ts-ignore
import airplay from '@silvermine/videojs-airplay';
import { registerIVSTech } from 'amazon-ivs-player';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

declare var window: any;

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule]
})
export class VideoPlayerComponent implements OnInit {
  // variables
  @ViewChild('target', { static: true }) target!: ElementRef;


  @Input() lowLatencyInput: boolean | undefined;

  @Input() options!: {
    fluid?: boolean;
    aspectRatio?: string;
    autoplay?: boolean;
    sources: {
      src: string;
      type: string;
    }[];
    controls?: boolean;
    fill?: boolean;
    techOrder?: string[];
    liveui?: boolean;
    plugins?: {
      airPlay?: {
        addButtonToControlBar?: boolean;
        buttonPositionIndex?: number;
      };
    };
  };

  // player!: videojs.Player;
  // player: videojs.Player | undefined | null;
  // player: any;
  player: any;

  endTime: number = 0;

  constructor(
    public kickService: KickService,
    public elementRef: ElementRef,
    private router: Router
  ) { }

  ngOnInit() {
    console.log('ngOnInit');
    // console.log(airplay);
  }

  ngAfterViewInit() {
    // console.log('ngAfterViewInit');
    console.log('lowlatency', this.lowLatencyInput);
    this.initializePlayerAndCast();
    this.addButtons();
  }

  initializeIVSPlayer() {
    const wasmBinaryPath = './assets/cast/amazon-ivs-wasmworker.min.wasm';
    const wasmWorkerPath = './assets/cast/amazon-ivs-wasmworker.min.js';
    const createAbsolutePath = (assetPath: string) => new URL(assetPath, document.baseURI).toString();
    // amazon ivs initialization
    registerIVSTech(videojs, {
      wasmWorker: createAbsolutePath(wasmWorkerPath),
      wasmBinary: createAbsolutePath(wasmBinaryPath),
    });
  }


  initializePlayerAndCast() {
    if (this.kickService.streamUrl() !== '') {

      if (this.kickService.lowLatency()) {
        // registerIVSQualityPlugin(videojs);
        this.options.techOrder = ['AmazonIVS', 'html5'];
        // console.log(this.options.techOrder);
        this.initializeIVSPlayer();
      } else {
        this.options.techOrder = ['chromecast', 'html5'];
        console.log(this.options.techOrder);
        // silvermine chromecast initialization
        // this.options.plugins = {
        //   airPlay: {
        //     addButtonToControlBar: true,
        //     buttonPositionIndex: 1,
        //   },
        // };
        chromecast(videojs, { preloadWebComponents: true });

        airplay(videojs);
      }


      this.options.sources = [
        {
          src: this.kickService.streamUrl(),
          type: 'application/x-mpegURL'
        }
      ];
      // console.log(this.options);
      this.player = videojs(this.target.nativeElement, this.options, function onPlayerReady(this: any) {
        console.log('onPlayerReady', this);
      });
      // airplay(videojs);
      // videojs.registerPlugin('airplay', airplay);

      if (this.kickService.lowLatency()) {
        // this.player.enableIVSQualityPlugin();
        this.player.src(this.kickService.streamUrl());
      } else {
        // chromecast do not work with ivs
        this.player.chromecast();
        this.player.airPlay();
      }

      // list all plugins
      // console.log(videojs.getPlugins());



    }
  }


  addButtons() {

    // reload
    this.addButtonCommonFunction(
      '<ion-icon name="refresh-outline"></ion-icon><div>Toggle Latency</div>',
      'Toggle Low Latency. Default is Low Latency',
      () => {
        this.kickService.reload();
      },
      this.player?.controlBar.el().lastChild
    );

    // theater mode
    this.addButtonCommonFunction(
      '<ion-icon src="./assets/cast/theater.svg"></ion-icon>Theatre',
      'Toggle Theatre Mode',
      () => this.kickService.theaterMode.set(!this.kickService.theaterMode()),
      this.player?.controlBar.el().lastChild
    );

    // chat
    this.addButtonCommonFunction(
      '<ion-icon name="chatbox-outline"></ion-icon><div>Chat</div>',
      'Toggle Chat',
      () => this.kickService.hidechat.set(!this.kickService.hidechat()),
      this.player?.controlBar.el().lastChild
    );


    // fast forward
    this.addButtonCommonFunction(
      '<ion-icon name="play-skip-forward-outline"></ion-icon><div>Forward</div>',
      'Fast Forward 5 seconds if possible',
      () => this.player?.currentTime(this.player?.currentTime() + 5),
      this.player?.controlBar.el().firstChild
    );

    // rewind
    this.addButtonCommonFunction(
      '<ion-icon name="play-skip-back-outline"></ion-icon><div>Rewind</div>',
      'Rewind 5 seconds if possible',
      () => this.player?.currentTime(this.player?.currentTime() - 5),
      this.player?.controlBar.el().firstChild
    );


    // airplay
    if (!!window.WebKitPlaybackTargetAvailabilityEvent) {
      this.addButtonCommonFunction(
        '<ion-icon name="logo-apple"></ion-icon><div>Airplay</div>',
        'Airplay',
        () => {
          this.player?.trigger('airPlayRequested');
          // hasAirPlayAPISupport
          // airplay.hasAirPlayAPISupport();
          // console.log(!!window.WebKitPlaybackTargetAvailabilityEvent);

        },
        this.player?.controlBar.el().firstChild
      );
    }

  }

  addButtonCommonFunction(_innerHTML: string, _title: string, clickFunction: () => void, childInsertBefore: any) {
    const theaterMode = videojs.dom.createEl('button', {
      className: 'custom-video-button vjs-control',
      innerHTML: _innerHTML,
    }, {
      title: _title,
      type: 'button'
    });
    theaterMode.addEventListener('click', clickFunction);
    this.player?.controlBar.addChild(theaterMode);
    // this.player?.controlBar.el().insertBefore(theaterMode, null);
    this.player?.controlBar.el().insertBefore(theaterMode, childInsertBefore);
  }

  // Dispose the player OnDestroy
  ngOnDestroy() {
    console.log('ngOnDestroy');
    if (this.player) {
      this.player.dispose();
      console.log('player disposed');
    }
  }

}
