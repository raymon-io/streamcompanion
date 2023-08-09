import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, Pipe, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { KickService } from '../../services/kick.service';
import { FormsModule } from '@angular/forms';

// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


// pusher
import Pusher from 'pusher-js';
import { ActivatedRoute } from '@angular/router';

interface ChatMessage {
  id: number;
  content: string;
  sender: {
    id: number,
    username: string;
    identity: {
      color: string;
    },
  },
  type: string;
  timestamp?: number;
}


@Component({
  selector: 'app-kick-chat',
  templateUrl: './kick-chat.component.html',
  styleUrls: ['./kick-chat.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
  ]
})



export class KickChatComponent implements OnInit {

  @Input() streamerId!: number | undefined;
  @Input() streamerUserId!: number | undefined;
  @Input() streamerChatroomId!: number | undefined;
  streamerSlug!: string | undefined;

  @ViewChild('chatContainer', { static: true }) chatContainer!: ElementRef;

  // chatDelay: boolean = false;


  cursor: number | undefined;

  messages: ChatMessage[] = [];

  intervalVar: any;

  showOverlay = false;
  isAtBottom = true;

  wsMessages: any[] = [];
  pusher: Pusher | undefined;

  emoteDict: any = {};


  constructor(
    public kickService: KickService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    // this.intervalVar = setInterval(() => this.loadMessageCheck(), 5000);
    this.loadMessageCheck();
    this.getWsChat();
    this.get7thTvEmotes();
    this.streamerSlug = this.route.snapshot.paramMap.get('streamerName') as string;
  }

  ngAfterViewInit() {
    // console.log('ngafterviewinit');
    setTimeout(() => this.scrollToBottom(), 1000);
  }


  ngOnDestroy() {
    clearInterval(this.intervalVar);
    console.log('kick chat destroyed');
    if (this.pusher) {
      // unsubscribe from pusher
      this.pusher.unsubscribe('chatrooms.' + this.streamerChatroomId + '.v2');
    } else {
      console.log('pusher not found');
    }
  }

  async get7thTvEmotes() {
    this.emoteDict = await this.kickService.getKick7TvEmotesList(this.streamerUserId, this.emoteDict);
  }


  getWsChat() {
    this.pusher = new Pusher('eb1d5f283081a78b932c', {
      cluster: 'us2',
      forceTLS: true
    });
    const channel = this.pusher.subscribe('chatrooms.' + this.streamerChatroomId + '.v2');
    // // Bind to a specific event on that channel
    channel.bind('App\\Events\\ChatMessageEvent', (data: any) => {
      let message = data.content;
      message = this.processMessage(message);
      data.content = message;
      data.timestamp = Math.floor(Date.now() / 1000);
      this.messages.push(data);
      setTimeout(() => this.scrollToBottom(), 100);
      if (this.messages.length > 200) {
        this.messages.splice(0, 30);
      }
    });
  }

  processMessage(message: string) {
    // segment message into words
    let words: any = [];
    try {
      words = message.split(' ');
    } catch (e) {
      console.log('MESSAGE ERROR', e);
      console.log(message);
      words = [];
    }
    // const words = message.split(' ');
    // loop through words
    for (let i = 0; i < words.length; i++) {
      if (words[i].startsWith('[emote:') && words[i].endsWith(']')) {
        // console.log('emote found', words[i]);
        // if [emote:123456:Clap] then replace with <img src="https://kick.com/emotes/123456.png" />
        const emoteId = words[i].split(':')[1];
        const emoteName = words[i].split(':')[2].replace(']', '');
        const emoteUrl = 'https://files.kick.com/emotes/' + emoteId + '/fullsize';
        // console.log(emoteId, emoteName, emoteUrl);
        let emoteHtml = '<img src="' + emoteUrl + '" title="' + emoteName + '" width="28" height="28" loading="lazy" />';
        message = message.replace(words[i], emoteHtml);
        // console.log(message);
      } else if (this.emoteDict && words[i] in this.emoteDict) {
        const url = 'https://cdn.7tv.app/emote/' + this.emoteDict[words[i]] + '/1x.avif';
        // console.log('emote found', words[i], url);
        let emoteHtml = '<img src="' + url + '" title="' + this.emoteDict[i] + '" width="28" height="28" loading="lazy" />';
        message = message.replace(words[i], emoteHtml);
      } else {
        // console.log('no emote found', words[i]);
      }
    }
    // return this.sanitizer.bypassSecurityTrustHtml(message);
    return message;
  }

  async loadMessageCheck() {
    if (this.isAtBottom) {
      this.loadMessages();
      // console.log('at bottom, loading messages');

    } else {
      this.showOverlay = true;
      // console.log('showing overlay');
    }

  }

  async loadMessages() {
    const chatroomUrl = "https://kick.com/api/v2/channels/" + this.streamerId + "/messages";
    console.log(chatroomUrl);
    const response = await fetch(chatroomUrl, {
      "method": "GET",
      "mode": "cors",
    });

    if (response.status == 200) {
      const message = await response.json();
      // console.log(message);
      const _cursor = message.data.cursor;
      if (_cursor && _cursor != this.cursor) {
        this.cursor = _cursor;
        this.messages = message.data.messages.reverse();
        // console.log('loaded messages');
      }
      else {
        console.log(_cursor);
        console.log(this.cursor);
      }
    } else {
      console.log('error loading messages');
    }
    setTimeout(() => this.scrollToBottom(), 100);
  }

  scrollToBottom() {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      this.showOverlay = false;
      this.isAtBottom = true;
      // console.log('scrolled to bottom');
    } catch (err) {
      console.error('Error while scrolling to the bottom:', err);
    }
  }

  onScroll() {
    const element = this.chatContainer.nativeElement;
    if (element.scrollHeight - element.scrollTop - element.clientHeight < 55) {
      this.isAtBottom = true;
      this.showOverlay = false;
    } else {
      this.showOverlay = true;
      this.isAtBottom = false;
      // console.log('not at bottom');
    }
    // this.isAtBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
  }

  // enableChatDelay() {
  //   this.chatDelay = !this.chatDelay;
  //   if (!this.chatDelay) {
  //     return;
  //   }
  //   console.log('chat delay enabled');

  // }


}

