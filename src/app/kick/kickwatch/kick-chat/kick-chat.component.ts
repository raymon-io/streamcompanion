import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, Pipe, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { KickService } from '../../services/kick.service';
import { FormsModule } from '@angular/forms';

// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


// pusher
import Pusher from 'pusher-js';

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

  @ViewChild('chatContainer', { static: true }) chatContainer!: ElementRef;


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
    // private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    // this.intervalVar = setInterval(() => this.loadMessageCheck(), 5000);
    this.loadMessageCheck();
    this.getWsChat();
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
    }
  }

  async getKick7TvEmotesList() {
    const endpointUrl = "https://7tv.io/v3/gql";
    const connectionPlatform = "KICK";
    const userByConnectionQuery = `
      query GetUserByConnection($platform: ConnectionPlatform!, $id: String!) {
        user: userByConnection(platform: $platform, id: $id) {
          id
          username
          connections {
            id
            username
            display_name
            platform
            linked_at
            emote_capacity
            emote_set_id
          }
        }
      }
    `;

    async function getUserByConnection(platform: string, id: any) {
      const response = await fetch(endpointUrl, {
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userByConnectionQuery,
          variables: { platform, id },
        }),
        method: "POST",
        mode: "cors",
      });

      const data = await response.json();
      return data;
    }
    const data = await getUserByConnection(connectionPlatform, this.streamerUserId?.toString());
    // check for response status
    let emoteSetId = '';
    if (data.data.user) {
      for (const i of data.data.user.connections) {
        if (i.platform == 'KICK') {
          console.log(i.emote_set_id);
          emoteSetId = i.emote_set_id;
        }
      }
    }

    if (emoteSetId) {
      const emoteSetQuery = `
query GetEmoteSet($id: ObjectID!, $formats: [ImageFormat!]) {
  emoteSet(id: $id) {
    id
    name
    emotes {
      name
      data {
        host {
          url
          files(formats: $formats) {
            name
            format
          }
        }
      }
    }
  }
}
`;

      async function getEmoteSetData(emoteSetId: string) {
        const response = await fetch(endpointUrl, {
          credentials: "omit",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: emoteSetQuery,
            // variables: { id: emoteSetId, formats: ["AVIF", "WEBP"] }, // Add any desired image formats here
            variables: { id: emoteSetId, formats: ["AVIF", "WEBP"] }, // Add any desired image formats here
          }),
          method: "POST",
          mode: "cors",
        });

        const data = await response.json();
        return data;
      }
      const emoteSetData = await getEmoteSetData(emoteSetId);
      if (emoteSetData.data.emoteSet) {
        // this.emotes = emoteSetData.data.emoteSet.emotes;
        // // make a list with all the emotes.id
        // for (const i of this.emotes) {
        //   this.emoteSearchFiles.push(i.id);
        // }
        // the data is like {id: '223', 'name':'bla'} make this in dictionary like {223: 'bla'}
        for (const i of emoteSetData.data.emoteSet.emotes) {
          this.emoteDict[i.id] = i.name;
        }


      }

    }

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
      } else if (this.emoteDict && i in this.emoteDict) {
        const url = 'https://cdn.7tv.app/emote/' + i + '/2x.avif';
        let emoteHtml = '<img src="' + url + '" title="' + this.emoteDict[i] + '" width="28" height="28" loading="lazy" />';
        message = message.replace(words[i], emoteHtml);
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


}

