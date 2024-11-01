import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModificarEquipoComponent } from './modificar-equipo.component';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [ModificarEquipoComponent],
  imports: [
    CommonModule,
    IonicModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Agrega esta línea
  exports: [ModificarEquipoComponent]
  
})
export class ModificarEquipoModule { }
