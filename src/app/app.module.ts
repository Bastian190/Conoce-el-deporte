import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { EditarrutinaComponent } from './componentes/editarrutina/editarrutina.component';
import { EditarperfilComponent } from './componentes/editarperfil/editarperfil.component';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { EquiposModule } from './equipo/equipo.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, EquiposModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
