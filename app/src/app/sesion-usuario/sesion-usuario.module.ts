import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SesionUsuarioPageRoutingModule } from './sesion-usuario-routing.module';

import { SesionUsuarioPage } from './sesion-usuario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SesionUsuarioPageRoutingModule
  ],
  declarations: [SesionUsuarioPage]
})
export class SesionUsuarioPageModule {}
