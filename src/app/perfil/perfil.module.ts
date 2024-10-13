import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { PerfilPageRoutingModule } from './perfil-routing.module';
import { PerfilPage } from './perfil.page';
import { ConfiguracionComponent } from 'src/app/componentes/configuracion/configuracion.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExploreContainerComponentModule,
    PerfilPageRoutingModule
  ],
  declarations: [PerfilPage,ConfiguracionComponent]
})
export class PerfilPageModule {}
