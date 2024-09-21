import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EditarperfilComponent } from './editarperfil.component';


@NgModule({
  declarations: [EditarperfilComponent], // Declara tu componente aquí
  imports: [
    CommonModule,
    IonicModule,
    // Importa el IonicModule para poder usar etiquetas como ion-card
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [EditarperfilComponent] // Exporta el componente si lo vas a usar en otros módulos
})
export class EditarperfilModule { }