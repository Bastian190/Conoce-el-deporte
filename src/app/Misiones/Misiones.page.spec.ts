import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Misiones } from './Misiones.page';

describe('Misiones', () => {
  let component: Misiones;
  let fixture: ComponentFixture<Misiones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Misiones],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(Misiones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
