import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';
import { RegistroRutinaComponent } from './registro-rutina.component';

@NgModule({
  declarations: [RegistroRutinaComponent],
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: [RegistroRutinaComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class RegistroRutinaModule { }
