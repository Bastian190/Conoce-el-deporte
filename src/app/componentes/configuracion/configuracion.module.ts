import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ConfiguracionComponent } from './configuracion.component';
import { PerfilPage } from 'src/app/perfil/perfil.page';
@NgModule({
  declarations: [ConfiguracionComponent], // Declara tu componente aquí
  imports: [
    CommonModule,
    IonicModule,
    PerfilPage,
    // Importa el IonicModule para poder usar etiquetas como ion-card
  ],
  exports: [ConfiguracionComponent] // Exporta el componente si lo vas a usar en otros módulos
})
export class ConfiguracionsModule { }