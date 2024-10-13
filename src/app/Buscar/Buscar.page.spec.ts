import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Buscar } from './buscar.page';

describe('Buscar', () => {
  let component: Buscar;
  let fixture: ComponentFixture<Buscar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Buscar],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(Buscar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
