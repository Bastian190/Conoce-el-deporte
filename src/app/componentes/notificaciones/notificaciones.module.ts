import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NotificacionesComponent } from './notificaciones.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [NotificacionesComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Agrega esta línea
  exports: [NotificacionesComponent]
})
export class NotificacionesModule { }
