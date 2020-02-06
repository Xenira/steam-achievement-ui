import { Injectable } from '@angular/core';

import { parseString } from 'xml2js';
import * as request from 'request';
import * as api from 'steam-js-api';

import { SharedModule } from '../shared.module';
import { GLOBAL_STATS, ACHIEVEMENTS, EXP_ACHIEVEMENTS, EXP_GLOBAL_STATS } from '../../constants';
import { CacheService, ICacheStoreAPI } from './cache.service';
import { IGame } from './games.service';

export interface IAchievementResult {
  achievements: IAchievement[];
  game: IAchievementGame;
  player: IPlayer;
  privacyState: 'public';
  hoursPlayed: number;
  visibilityState: number;
  cached?: boolean;
}

export interface IAchievement {
  closed: boolean;
  apiname: string;
  description: string;
  iconClosed: string;
  iconOpen: string;
  name: string;
  unlockTimestamp?: number;
  globalCompletion?: number;
}

export interface IAchievementGame {
  friendlyName: string;
  icon: string;
  link: string;
  logo: string;
  logoSmall: string;
  name: string;
}

export interface IPlayer {
  customURL: string;
  steamID64: string;
}

export interface IGlobalAchievementStats {
  [apiName: string]: number
}

@Injectable({
  providedIn: SharedModule
})
export class AchieventService {

  private cache: ICacheStoreAPI;

  constructor(cacheService: CacheService) {
    this.cache = cacheService.getCache();
    api.setKey('234233832887F100EBBC107EDCA619C0');
  }

  public getAchievements(game: IGame, force = false): Promise<IAchievementResult> {
    if (!game.statsLink) {
      return Promise.reject("No achievements");
    }
    const achievements = this.cache.get(`${ACHIEVEMENTS}_${game.appId}`);
    if (!force && achievements) return Promise.resolve({ cached: true, ...achievements });

    console.debug('Getting achievements for', game)
    return new Promise((resolve, reject) => request(`${game.statsLink}?xml=1`, (error, _respones, body: string) => {
      if (error) {
        return reject(error);
      }
      if (body.startsWith('<!DOCTYPE html>')) {
        this.cache.set(`${ACHIEVEMENTS}_${game.appId}`, {}, EXP_ACHIEVEMENTS);
        return reject({ message: 'There was a failure loading user game stats.', game: game })
      }
      parseString(body, (err, res) => {
        if (err) return reject(err);
        const result = this.parseAchievementsResponse(res);

        this.getGlobalAchievementStats(game.appId).then((stats) => {
          result.achievements = result.achievements.map(achievement => {
            achievement.globalCompletion = stats ? stats[achievement.apiname] : 0;
            return achievement;
          }).sort((a, b) => a.globalCompletion - b.globalCompletion);
          return result;
        }).then((result) => {
          this.cache.set(`${ACHIEVEMENTS}_${game.appId}`, result, EXP_ACHIEVEMENTS);
          resolve({ cached: false, ...result } as IAchievementResult);
        });
      })
    }))
  }

  private parseAchievementsResponse(res: any) {
    const stats = res.playerstats;
    const rawPlayer = stats.player[0];
    const player: IPlayer = {
      customURL: rawPlayer.customURL[0],
      steamID64: rawPlayer.steamID64[0]
    };

    const result: IAchievementResult = {
      achievements: (stats.achievements && stats.achievements[0].achievement) ? stats.achievements[0].achievement.map(achievement => this.parseAchievements(achievement)) : [],
      game: this.parseGame(stats.game[0]),
      player,
      privacyState: stats.privacyState[0],
      hoursPlayed: Number((stats.stats[0].hoursPlayed || [0])[0]),
      visibilityState: Number(stats.visibilityState[0])
    };

    return result;
  }

  private parseAchievements(achievement: any) {
    return {
      closed: achievement.$.closed === '1',
      apiname: achievement.apiname[0],
      description: achievement.description[0],
      iconClosed: achievement.iconClosed[0],
      iconOpen: achievement.iconOpen[0],
      name: achievement.name[0],
      unlockTimestamp: achievement.unlockTimestamp ? Number(achievement.unlockTimestamp[0]) : null
    }
  }

  private parseGame(game: any): IAchievementGame {
    return {
      friendlyName: game.gameFriendlyName[0],
      icon: game.gameIcon[0],
      link: game.gameLink[0],
      logo: game.gameLogo[0],
      logoSmall: game.gameLogoSmall[0],
      name: game.gameName[0]
    }
  }


  public getGlobalAchievementStats(appId: string, force = false): Promise<IGlobalAchievementStats> {
    const stats: IGlobalAchievementStats = this.cache.get(`${GLOBAL_STATS}_${appId}`);
    if (!force && stats) return Promise.resolve(stats);

    return new Promise((resolve, reject) => {
      console.debug('Requesting global achievement stats for', appId)
      return api.getGlobalAchievements(appId)
        .then((result) => {
          this.cache.set(`${GLOBAL_STATS}_${appId}`, result.data.achievements, EXP_GLOBAL_STATS);
          resolve(result.data.achievements);
        })
        .catch((err) => reject(err))
    });
  }
}
