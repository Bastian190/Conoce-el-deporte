import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { RegistroComponent } from './componentes/registro/registro.component';
import { RegistroRutinaComponent } from './registro-rutina/registro-rutina.component';
import { EquipoComponent } from './equipo/equipo.component';
const routes: Routes = [
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./sesion-usuario/sesion-usuario.module').then( m => m.SesionUsuarioPageModule)
  },
  {
    path: 'registro', 
    component: RegistroComponent  
  },
  {
    path: 'registroRutina',
    component: RegistroRutinaComponent
  },
  
  {path: 'equipo',
  component: EquipoComponent
  },


  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
