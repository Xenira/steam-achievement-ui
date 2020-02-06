import { Component, OnInit, Input } from '@angular/core';
import { IAchievement } from '../../shared/services/achievent.service';

@Component({
  selector: 'app-achievement',
  templateUrl: './achievement.component.html',
  styleUrls: ['./achievement.component.scss']
})
export class AchievementComponent implements OnInit {
  @Input() achievement: IAchievement;

  constructor() { }

  ngOnInit() {
  }

}
