import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EquipoComponent } from './equipo.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
@NgModule({
  declarations: [EquipoComponent], // Declara tu componente aquí
  imports: [
    CommonModule,
    IonicModule, // Importa el IonicModule para poder usar etiquetas como ion-card
  ],
  exports: [EquipoComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Exporta el componente si lo vas a usar en otros módulos
})
export class EquiposModule { }
