import { Injectable } from '@angular/core';
import { SharedModule } from '../shared.module';
import { STORAGE_KEY, GAMES_LIST, EXP_GAMES_LIST } from '../../constants';
import { CacheService, ICacheStoreAPI } from './cache.service';
import { parseString } from 'xml2js';
import * as request from 'request'
import { IAchievementResult } from './achievent.service';

export interface IGamesList {
  steamID64: number,
  steamID: string,
  games: IGame[]
}

export interface IGame {
  appId: string,
  name: string,
  logo: string,
  storeLink: string,
  hoursLast2Weeks?: number,
  hoursOnRecord?: number,
  statsLink?: string,
  globalStatsLink?: string,
  achievements?: IAchievementResult
}

@Injectable({
  providedIn: SharedModule
})
export class GamesService {
  cache: ICacheStoreAPI;

  constructor(cacheService: CacheService) {
    this.cache = cacheService.getCache();
  }

  getGamesList(userId: string, force = false): Promise<IGamesList> {
    const gamesList: IGamesList = this.cache.get(`${GAMES_LIST}`);

    if (!force && gamesList) return Promise.resolve(gamesList);

    return new Promise((resolve, reject) => request(`https://steamcommunity.com/id/${userId}/games/?tab=all&xml=1`, (error, _respones, body) => {
      if (error) {
        return reject(error);
      }

      parseString(body, (err, res) => {
        if (err) return reject(err);
        const gamesList = this.parseGamesList(res.gamesList);
        this.cache.set(`${GAMES_LIST}`, gamesList, EXP_GAMES_LIST)
        resolve(gamesList);
      });
    }))
  }

  parseGamesList(gamesList: any): IGamesList {
    return {
      games: gamesList.games[0].game.map((game) => this.parseGame(game)),
      steamID: gamesList.steamID[0],
      steamID64: Number.parseInt(gamesList.steamID64[0])
    }
  }

  parseGame(game: any): IGame {
    return {
      appId: game.appID[0],
      globalStatsLink: (game.globalStatsLink || [null])[0],
      hoursLast2Weeks: game.hoursLast2Weeks ? Number(game.hoursLast2Weeks[0]) : null,
      hoursOnRecord: game.hoursOnRecord ? Number(game.hoursOnRecord[0]) : null,
      logo: game.logo[0],
      name: game.name[0],
      statsLink: (game.statsLink || [null])[0],
      storeLink: game.storeLink[0]
    }
  }

  // parseGamesList(profile): IGamesList {
  //   return {

  //   }
  // }
}
