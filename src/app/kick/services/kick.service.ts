import { Injectable, WritableSignal, signal } from '@angular/core';
import { Kickinterface } from '../interfaces/kickinterface';

@Injectable({
  providedIn: 'root'
})
export class KickService {
  // variables
  signalStreamer: WritableSignal<Kickinterface | null> = signal(null);
  streamUrl: WritableSignal<string> = signal('');

  // videoplayer controls
  hidechat: WritableSignal<boolean> = signal(false);
  theaterMode: WritableSignal<boolean> = signal(false);

  // chat controls
  inlineChat: WritableSignal<boolean> = signal(true);

  // video reload
  reloadBoolean: WritableSignal<boolean> = signal(true);
  // lowlatency (ivs) is default
  lowLatency: WritableSignal<boolean> = signal(true);

  // functions
  constructor() { }

  // reload
  reload() {
    this.reloadBoolean.set(false);
    this.lowLatency.set(!this.lowLatency());
    setTimeout(() => {
      this.reloadBoolean.set(true);
    }, 100);
  }

  async getApi(searchUsername: string) {
    const url = 'https://kick.com/api/v2/channels/' + searchUsername;
    const response = await fetch(url);
    let returnData: Kickinterface | null = null;
    if (response.status == 200) {
      // console.log("success");
      returnData = (await response.json()) as Kickinterface;
    } else {
      console.log("fail");
      returnData = null;
    }
    // console.log('returnData from getApi');
    // console.log(returnData);
    return returnData;
  } 
}
