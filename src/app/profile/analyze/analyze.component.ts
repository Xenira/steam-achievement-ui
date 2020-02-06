import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faDiagnoses, faBed, faBookReader, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { fadeInLeftOnEnterAnimation, fadeOutRightOnLeaveAnimation } from "angular-animations";
import { IProfile } from '../../shared/services/profile.service';
import { GamesService, IGame } from '../../shared/services/games.service';
import { IAchievementResult, AchieventService } from '../../shared/services/achievent.service';

const MAX_GAMES_PER_CYCLE = 50;

enum AnalysisState {
  READY = 'ready',
  READ_PROFILE = 'readProfile',
  GATHER_DATA = 'gatherData',
  SLEEP = 'sleep',
  ERROR = 'error'
}

@Component({
  selector: 'app-analyze',
  templateUrl: './analyze.component.html',
  styleUrls: ['./analyze.component.scss'],
  animations: [
    fadeInLeftOnEnterAnimation(),
    fadeOutRightOnLeaveAnimation(),
  ]
})
export class AnalyzeComponent implements OnInit {
  private _profile: IProfile;
  @Input() set profile(value: IProfile) {
    if (JSON.stringify(value) !== JSON.stringify(this._profile)) {
      this._profile = value;
      this.readProfile();
    }
  }
  get profile() { return this._profile }

  @Output() game = new EventEmitter<IGame>();

  public state = AnalysisState.READY;
  public currentGame: IGame;
  public totalCount: number = 0;
  public currentIndex: number = 0;

  private _icon: IconDefinition;
  get icon() { return this._icon; }
  set icon(value: IconDefinition) {
    this.iconVisible = false;
    setTimeout(() => this._icon = value, 500);
    setTimeout(() => this.iconVisible = true, 1000);
  }
  public iconVisible = false;

  constructor(private gamesService: GamesService, private achievementService: AchieventService) { }

  ngOnInit() {
  }

  readProfile() {
    this.state = AnalysisState.READ_PROFILE;
    this.icon = faBookReader;
    this.gamesService.getGamesList(this.profile.customURL || this.profile.steamID64.toString()).then(async (games) => {
      this.totalCount = games.games.length;
      while (games.games.length > 0) {
        await this.analyzeGames(games.games);
        if (games.games.length > 0) {
          await this.sleep();
        }
      }
    });
  }

  async analyzeGames(games: IGame[]) {
    this.state = AnalysisState.GATHER_DATA;
    this.icon = faDiagnoses;
    let requestedGames = 0;
    for (let i = 0; i < games.length; i++) {
      const game = games.shift();
      this.currentGame = game;
      this.currentIndex++;
      try {
        const achievements = await this.achievementService.getAchievements(game);

        if (!achievements.cached) {
          console.debug(achievements)
          requestedGames++;
        }

        this.game.next({ achievements, ...game });
        await new Promise(resolve => setTimeout(() => resolve(), achievements.cached ? 0 : 500));
      } catch {
        this.game.next(game);
      }

      if (requestedGames >= MAX_GAMES_PER_CYCLE) {
        break;
      }
    }
  }

  private async sleep() {
    this.state = AnalysisState.SLEEP;
    this.icon = faBed
    return new Promise(resolve => setTimeout(() => resolve(), 5000 + Math.random() * 10000));
  }

}
