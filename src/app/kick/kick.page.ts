import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { Kickinterface } from './interfaces/kickinterface';
import { KickService } from './services/kick.service';
import { KickprofileComponent } from './kickprofile/kickprofile.component';
// import { TestcompComponent } from '../testcomp/testcomp.component';

@Component({
  selector: 'app-kick',
  templateUrl: './kick.page.html',
  styleUrls: ['./kick.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, KickprofileComponent]
})
export class KickPage implements OnInit {
  // variables
  // featured variables
  featuredStreamersList = ['xqc'];
  featuredStreamers: Kickinterface[] = [];

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
    for (const i of this.featuredStreamersList) {
      const data = await this.kickService.getApi(i) as Kickinterface;
      _featuredStreamersList.push(data);
    }
    this.featuredStreamers = _featuredStreamersList;
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
          const livestream = (await this.kickService.getApi(i.slug))?.livestream;
          channels[channels.indexOf(i)].livestream = livestream;
        }
        this.searchFound = true;
        this.searching = false;
        this.searchStreamers = channels;
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
