import { TestBed } from '@angular/core/testing';

import { NotificacionService } from './notificaciones-service.service';

describe('NotificacionesServiceService', () => {
  let service: NotificacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
