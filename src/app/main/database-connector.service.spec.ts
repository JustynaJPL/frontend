import { TestBed } from '@angular/core/testing';

import { DatabaseConnectorService } from './database-connector.service';

describe('DatabaseConnectorService', () => {
  let service: DatabaseConnectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatabaseConnectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
