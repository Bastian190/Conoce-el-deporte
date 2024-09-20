import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { EquipoComponent } from '../equipo/equipo.component'; 
const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'Inicio',
        loadChildren: () => import('../Inicio/Inicio.module').then(m => m.InicioPageModule)
      },
      {
        path: 'Buscar',
        loadChildren: () => import('../Buscar/Buscar.module').then(m => m.BuscarPageModule)
      },
      {
        path: 'Misiones',
        loadChildren: () => import('../Misiones/Misiones.module').then(m => m.MisionesPageModule)
      },
      {
        path: 'perfil',
        loadChildren: () => import('../perfil/perfil.module').then( m => m.PerfilPageModule)
      },
      {
        path: 'equipo', 
        component: EquipoComponent  
      },
      {
        path: '',
        redirectTo: '/tabs/Inicio',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/Inicio',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
