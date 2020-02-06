import { Component, OnInit, NgZone } from '@angular/core';
import { ProfileService, IProfile } from '../shared/services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public profile: IProfile;

  constructor(private profileService: ProfileService, private ngZone: NgZone) { }

  ngOnInit() {
    this.profileService.getProfile('xenira').then((profile) => {
      this.profile = profile
    });
  }

}
