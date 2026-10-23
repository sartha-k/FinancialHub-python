import { TestBed } from '@angular/core/testing';
import { SsavingsPlan } from './ssavings-plan';

describe('SsavingsPlan', () => {
  let service: SsavingsPlan;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SsavingsPlan);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
