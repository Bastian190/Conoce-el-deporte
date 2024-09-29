import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { editarrutinaModule } from './componentes/editarrutina/editarrutina.module';
import { EditarperfilModule } from './componentes/editarperfil/editarperfil.module';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { EquiposModule } from './equipo/equipo.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule,FormsModule, IonicModule.forRoot(), AppRoutingModule, EquiposModule,EditarperfilModule,editarrutinaModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
