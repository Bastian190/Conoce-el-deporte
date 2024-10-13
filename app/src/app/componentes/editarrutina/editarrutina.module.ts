import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EditarrutinaComponent } from './editarrutina.component';



@NgModule({
  declarations: [EditarrutinaComponent], // Declara tu componente aquí
  imports: [
    CommonModule,
    IonicModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Agrega esta línea
  exports: [EditarrutinaComponent] // Exporta el componente si lo vas a usar en otros módulos
})
export class EditarrutinaModule { }
