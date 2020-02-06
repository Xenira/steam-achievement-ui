import { Injectable } from '@angular/core';
import * as moment from "moment";
import * as request from 'request';
import { parseString } from 'xml2js';
import { ReplaySubject } from 'rxjs';
import { STORAGE_KEY, PROFILE, EXP_PROFILE } from '../../constants';
import { SharedModule } from '../shared.module';
import { CacheService, ICacheStoreAPI } from './cache.service';

export interface IProfile {
  steamID64: number,
  steamID: string,
  onlineState: 'online' | 'offline',
  stateMessage: string,
  privacyState: 'public' | 'private',
  visibilityState: number,
  avatarIcon: string,
  avatarMedium: string,
  avatarFull: string,
  vacBanned: number,
  tradeBanState: string,
  isLimitedAccount: number,
  customURL: string,
  memberSince: moment.Moment,
  hoursPlayed2Wk: number,
  headline: string,
  location: string,
  realname: string,
  summary: string,
  mostPlayedGames: IMostPlayedGame[],
  groups: IGroup[],
  steamRating: string
}

export interface IMostPlayedGame {
  gameName: string,
  gameLink: string,
  gameIcon: string,
  gameLogo: string,
  gameLogoSmall: string,
  hoursPlayed: number,
  hoursOnRecord: number
}

export interface IGroup {
  isPrimary: boolean,
  groupID64: number,
  groupName?: string,
  groupURL?: string,
  headline?: string,
  summary?: string,
  avatarIcon?: string,
  avatarMedium?: string,
  avatarFull?: string,
  memberCount?: number,
  membersInChat?: number,
  membersInGame?: number,
  membersOnline?: number
}

@Injectable({
  providedIn: SharedModule
})
export class ProfileService {
  cache: ICacheStoreAPI;

  constructor(cacheService: CacheService) {
    this.cache = cacheService.getCache();
  }

  getProfile(userId: string, force = false): Promise<IProfile> {
    const profile: IProfile = this.cache.get(`${PROFILE}`);

    if (!force && profile) return Promise.resolve(profile);
    console.log('No cached profile. Reading from steam.')

    return new Promise((resolve, reject) => request(`https://steamcommunity.com/id/${userId}?xml=1`, (error, _respones, body) => {
      if (error) {
        return reject(error);
      }

      parseString(body, (err, res) => {
        if (err) return reject(err);
        const profile = this.parseProfile(res.profile);
        this.cache.set(`${PROFILE}`, profile, EXP_PROFILE)
        resolve(profile);
      });
    }))
  }

  parseProfile(profile): IProfile {
    return {
      avatarFull: profile.avatarFull[0],
      avatarIcon: profile.avatarIcon[0],
      avatarMedium: profile.avatarMedium[0],
      customURL: profile.customURL[0],
      groups: profile.groups[0].group.map(group => this.parseGroup(group)),
      headline: profile.headline[0],
      hoursPlayed2Wk: Number.parseFloat(profile.hoursPlayed2Wk[0]),
      isLimitedAccount: Number(profile.isLimitedAccount[0]),
      location: profile.location[0],
      memberSince: moment(profile.memberSince[0]),
      mostPlayedGames: profile.mostPlayedGames[0].mostPlayedGame.map(game => this.parseMostPlayedGames(game)),
      onlineState: profile.onlineState[0],
      privacyState: profile.privacyState[0],
      realname: profile.realname[0],
      stateMessage: profile.stateMessage[0],
      steamID: profile.steamID[0],
      steamID64: Number.parseInt(profile.steamID64[0]),
      steamRating: profile.steamRating[0],
      summary: profile.summary[0],
      tradeBanState: profile.tradeBanState[0],
      vacBanned: Number(profile.vacBanned[0]),
      visibilityState: Number(profile.visibilityState[0])
    }
  }
  parseMostPlayedGames(game: any): IMostPlayedGame {
    return {
      gameIcon: game.gameIcon[0],
      gameLink: game.gameLink[0],
      gameLogo: game.gameLogo[0],
      gameLogoSmall: game.gameLogoSmall[0],
      gameName: game.gameName[0],
      hoursOnRecord: Number(game.hoursOnRecord[0]),
      hoursPlayed: Number(game.hoursPlayed[0])
    }
  }

  parseGroup(group: any): IGroup {
    return {
      isPrimary: Boolean(group.$.isPrimary),
      avatarFull: (group.avatarFull || [null])[0],
      avatarIcon: (group.avatarIcon || [null])[0],
      avatarMedium: (group.avatarMedium || [null])[0],
      groupID64: Number.parseInt(group.groupID64[0]),
      groupName: (group.groupName || [null])[0],
      groupURL: (group.groupURL || [null])[0],
      headline: (group.headline || [null])[0],
      memberCount: (Number.parseInt(group.memberCount || [null])[0]),
      membersInChat: (Number.parseInt(group.membersInChat || [null])[0]),
      membersInGame: (Number.parseInt(group.membersInGame || [null])[0]),
      membersOnline: (Number.parseInt(group.membersOnline || [null])[0]),
      summary: (group.summary || [null])[0]
    }
  }


}
