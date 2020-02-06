import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { AnalyzeComponent } from './analyze/analyze.component';
import { GameComponent } from './analyze/game/game.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { GamesComponent } from './games/games.component';
import { AchievementsComponent } from './achievements/achievements.component';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [ProfileComponent, AnalyzeComponent, GameComponent, GamesComponent, AchievementsComponent],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    FontAwesomeModule,
    TranslateModule.forChild()
  ]
})
export class ProfileModule { }
