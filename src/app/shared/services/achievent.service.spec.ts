import { TestBed } from '@angular/core/testing';

import { AchieventService } from './achievent.service';

describe('AchieventService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AchieventService = TestBed.get(AchieventService);
    expect(service).toBeTruthy();
  });
});
