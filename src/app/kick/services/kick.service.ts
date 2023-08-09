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

  async getKick7TvEmotesList(streamerUserId: any, emoteDict: any) {
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
    const data = await getUserByConnection(connectionPlatform, streamerUserId?.toString());
    // console.log('userbyconnection', data);
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
        query GetEmoteSet($id: ObjectID!) {
          emoteSet(id: $id) {
            emotes {
              id
              name
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
            variables: { id: emoteSetId }, // Add any desired image formats here
          }),
          method: "POST",
          mode: "cors",
        });

        const data = await response.json();
        return data;
      }
      const emoteSetData = await getEmoteSetData(emoteSetId);
      // console.log('emoteSetData', emoteSetData);
      if (emoteSetData.data.emoteSet) {
        for (const i of emoteSetData.data.emoteSet.emotes) {
          emoteDict[i.name] = i.id;
        }
      }

    } // end if emoteSetId
    // console.log('emoteDict', this.emoteDict);
    return emoteDict;

  } // end getKick7TvEmotesList() function


}
