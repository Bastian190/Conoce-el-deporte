import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { EquipoComponent } from '../equipo/equipo.component'; 
import { ConfiguracionComponent } from '../componentes/configuracion/configuracion.component';
import { EditarperfilComponent } from '../componentes/editarperfil/editarperfil.component';
import { EditarrutinaComponent } from '../componentes/editarrutina/editarrutina.component';

import { ModificarEquipoComponent } from '../componentes/modificar-equipo/modificar-equipo.component';
import { AgregarLogrosYPartidosComponent } from '../componentes/agregar-logros-ypartidos/agregar-logros-ypartidos.component';
const routes: Routes = [
  {
    path: '',
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
        path: 'equipo/:nombre_equipo', 
        component: EquipoComponent  
      },
      {
        path: 'configuracion',
        component:ConfiguracionComponent
      },
      {
        path: 'editar-perfil',
        component:EditarperfilComponent
      },
      {
        path: 'editarrutina',
        component: EditarrutinaComponent
      },
      {
        path:'modificarEquipo',
        component: ModificarEquipoComponent
      },
      {
        path:'AgregarLogrosPartidos',
        component:AgregarLogrosYPartidosComponent
      },

      {
        path: '',
        redirectTo: 'Inicio',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'Inicio',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
