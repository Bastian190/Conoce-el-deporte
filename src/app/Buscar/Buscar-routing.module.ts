import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Buscar } from './Buscar.page';

const routes: Routes = [
  {
    path: '',
    component: Buscar,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab2PageRoutingModule {}
