import { Injectable, WritableSignal, signal } from '@angular/core';
import { Kickinterface } from '../interfaces/kickinterface';

@Injectable({
  providedIn: 'root'
})
export class KickService {
  // variables
  signalStreamer: WritableSignal<Kickinterface | null> = signal(null);
  streamUrl: WritableSignal<string> = signal('');

  // functions
  constructor() { }

  async getApi(searchUsername: string) {
    const url = 'https://kick.com/api/v2/channels/' + searchUsername;
    const response = await fetch(url);
    let returnData: Kickinterface | null = null;
    if (response.status == 200) {
      console.log("success");
      returnData = (await response.json()) as Kickinterface;
    } else {
      console.log("fail");
      returnData = null;
    }
    return returnData;
  } 
}
