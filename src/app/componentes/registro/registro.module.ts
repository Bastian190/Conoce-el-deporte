import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RegistroComponent } from './registro.component';



@NgModule({
  declarations: [RegistroComponent], // Declara tu componente aquí
  imports: [
    CommonModule,
    IonicModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Agrega esta línea
  exports: [RegistroComponent] // Exporta el componente si lo vas a usar en otros módulos
})
export class registroModule { }
