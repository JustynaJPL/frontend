import { TestBed } from '@angular/core/testing';

import { GeneratePlanService } from './generate-plan.service';

describe('GeneratePlanService', () => {
  let service: GeneratePlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneratePlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
