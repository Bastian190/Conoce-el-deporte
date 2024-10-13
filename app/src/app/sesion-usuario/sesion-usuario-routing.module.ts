import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SesionUsuarioPage } from './sesion-usuario.page';

const routes: Routes = [
  {
    path: '',
    component: SesionUsuarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SesionUsuarioPageRoutingModule {}
