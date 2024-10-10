import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RecuperarComponent } from './recuperar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [RecuperarComponent], // Declara tu componente aquí
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Agrega esta línea
  exports: [RecuperarComponent] // Exporta el componente si lo vas a usar en otros módulos
})
export class recuperarModule { }