import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Misiones } from './Misiones.page';

const routes: Routes = [
  {
    path: '',
    component: Misiones,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab3PageRoutingModule {}
