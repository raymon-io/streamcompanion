import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { KickService } from '../../services/kick.service';
import { ActivatedRoute } from '@angular/router';
import { Kickinterface } from '../../interfaces/kickinterface';
import { KickChatComponent } from '../kick-chat/kick-chat.component';

@Component({
  selector: 'app-popout-chat',
  templateUrl: './popout-chat.page.html',
  styleUrls: ['./popout-chat.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, KickChatComponent]
})
export class PopoutChatPage implements OnInit {

  streamerSlug: string = '';
  streamerId: any;
  streamerUserId: any;
  streamerChatroomId: any;


  constructor(
    private kickService: KickService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.streamerSlug = this.route.snapshot.paramMap.get('streamerSlug') as string;
    this.getStreamerInfo();


  }

  ngAfterViewInit() {
  
  }

  async getStreamerInfo() {
    console.log(this.streamerSlug);
    const returnData = await this.kickService.getApi(this.streamerSlug) as Kickinterface;
    console.log(returnData);
    this.streamerId = returnData.id;
    this.streamerUserId = returnData.user_id;
    this.streamerChatroomId = returnData.chatroom?.id;

  }
}
