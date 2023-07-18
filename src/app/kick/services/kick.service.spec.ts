import { TestBed } from '@angular/core/testing';

import { KickService } from './kick.service';

describe('KickService', () => {
  let service: KickService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KickService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
