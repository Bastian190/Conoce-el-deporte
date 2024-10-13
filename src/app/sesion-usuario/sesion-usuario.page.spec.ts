import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SesionUsuarioPage } from './sesion-usuario.page';

describe('SesionUsuarioPage', () => {
  let component: SesionUsuarioPage;
  let fixture: ComponentFixture<SesionUsuarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SesionUsuarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
