import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { Kickinterface } from './interfaces/kickinterface';
import { KickService } from './services/kick.service';
import { KickprofileComponent } from './kickprofile/kickprofile.component';
import { FooterComponent } from '../footer/footer.component';
// import { TestcompComponent } from '../testcomp/testcomp.component';

@Component({
  selector: 'app-kick',
  templateUrl: './kick.page.html',
  styleUrls: ['./kick.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, KickprofileComponent, FooterComponent]
})
export class KickPage implements OnInit {
  // variables
  // featured variables
  featuredStreamersListHardCoded = ['xqc'];
  featuredStreamers: Kickinterface[] = [];
  nonFollowingVar: any[] = [];

  // search variables
  searchTerm: string = '';
  searchFound: boolean = true;
  searching: boolean = false;

  searchStreamerExact: Kickinterface | null = null;
  searchStreamers: Kickinterface[] = [];

  // functions
  constructor(
    private kickService: KickService
  ) { }

  ngOnInit() {
    this.getFeaturedStreamers();
  }

  async getFeaturedStreamers() {
    let _featuredStreamersList = [];

    // get hardcoded featured streamers
    for (const i of this.featuredStreamersListHardCoded) {
      const data = await this.kickService.getApi(i) as Kickinterface;
      this.featuredStreamers.push(data);
    }

    await this.getNonFollowingFeatured();
  }

  async getNonFollowingFeatured() {
    const url = 'https://kick.com/featured-livestreams/non-following';
    const response = await fetch(url);
    if (response.status == 200) {
      const data = await response.json();
      this.nonFollowingVar = data;
      // load only the first 3
      for (const i of data.slice(0, 3)) {
        const profileData = (await this.kickService.getApi(i.channel_slug)) as Kickinterface;
        this.featuredStreamers.push(profileData);
        // remote the streamer from the nonFollowingVar
        this.nonFollowingVar.splice(this.nonFollowingVar.indexOf(i), 1);
      }
      
    }
    // console.log(this.featuredStreamers);
  }

  async loadMoreFeatured() {
    for (const i of this.nonFollowingVar) {
      const profileData = (await this.kickService.getApi(i.channel_slug)) as Kickinterface;
      this.featuredStreamers.push(profileData);
      // remote the streamer from the nonFollowingVar
      this.nonFollowingVar.splice(this.nonFollowingVar.indexOf(i), 1);
    }
  }

  async searchStreamer() {
    this.searching = true;
    if (this.searchTerm.length < 3) {
      this.searchFound = false;
      this.searching = false;
      return;
    }
    const url = 'https://kick.com/api/search?searched_word=' + this.searchTerm;
    const response = await fetch(url);
    if (response.status == 200) {
      const data = await response.json();
      if (data['channels'] != null && data['channels'].length > 0) {
        const channels = data['channels'] as Kickinterface[];
        // add livestream to popular streamers
        console.log(channels.length);
        for (const i of channels) {
          if (i.isLive) {
            const profileData = (await this.kickService.getApi(i.slug)) as Kickinterface;
            const livestream = profileData?.livestream;
            const playbackUrl = profileData?.playback_url;
            channels[channels.indexOf(i)].livestream = livestream;
            channels[channels.indexOf(i)].playback_url = playbackUrl;
          }
        }
        this.searchFound = true;
        this.searching = false;
        this.searchStreamers = channels;
        // console.log(this.searchStreamers);
        this.searchStreamers.sort((a, b) => {
          if (typeof b?.followersCount == 'number' && typeof a?.followersCount == 'number') {
            return b.followersCount - a.followersCount;
          } else {
            console.log('should not happen');
            return 0;
          }
        });
        // console.log(this.searchStreamers);
      } else {
        this.searchFound = false;
        this.searching = false;
      }
    } else { // not 200
      console.log('not 200 status');
      this.searchFound = false;
      this.searching = false;
    }

  }


}
