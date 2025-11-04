import { TestBed } from '@angular/core/testing';

import { Convert } from './convert';

describe('Convert', () => {
  let service: Convert;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Convert);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
