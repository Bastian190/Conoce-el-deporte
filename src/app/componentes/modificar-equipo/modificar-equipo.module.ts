import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModificarEquipoComponent } from './modificar-equipo.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [ModificarEquipoComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Agrega esta línea
  exports: [ModificarEquipoComponent]
  
})
export class ModificarEquipoModule { }
