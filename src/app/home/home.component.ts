import { Component, OnInit } from '@angular/core';
import { AchieventService, IAchievementResult } from '../shared/services/achievent.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public achievements: IAchievementResult;
  public completed = 0;
  public score = 0;
  public maxScore = 0;

  constructor(private achievementService: AchieventService) { }

  ngOnInit(): void {
    // this.achievementService.getAchievements().then((result: IAchievementResult) => {
    //   this.achievements = result;
    //   console.dir(this.achievements);
    //   this.analyseInput();
    // }).catch((err) => console.error(err));
  }

  analyseInput() {
    if (!this.achievements || !this.achievements.achievements) return;
    this.completed = this.achievements.achievements.filter(a => a.closed).length;
    this.maxScore = this.achievements.achievements.reduce((prev, achievement) => prev + (achievement.globalCompletion || 0), 0);
    this.score = this.achievements.achievements.reduce((prev, achievement) => prev + (achievement.closed ? (achievement.globalCompletion || 0) : 0), 0);
  }

}
