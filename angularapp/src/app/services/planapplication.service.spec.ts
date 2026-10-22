import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Import HttpClientTestingModule

import { PlanapplicationService } from './planapplication.service';

describe('PlanapplicationService', () => {
  let service: PlanapplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Add HttpClientTestingModule to the imports if HttpClient is used
    });
    service = TestBed.inject(PlanapplicationService);
  });

  fit('Frontend_should_create_PlanApplicationFormService_service', () => {
    expect(service).toBeTruthy();
  });
});
