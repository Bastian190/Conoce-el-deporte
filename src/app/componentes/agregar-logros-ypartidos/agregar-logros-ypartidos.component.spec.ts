import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AgregarLogrosYPartidosComponent } from './agregar-logros-ypartidos.component';

describe('AgregarLogrosYPartidosComponent', () => {
  let component: AgregarLogrosYPartidosComponent;
  let fixture: ComponentFixture<AgregarLogrosYPartidosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AgregarLogrosYPartidosComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarLogrosYPartidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
