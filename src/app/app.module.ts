import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { editarrutinaModule } from './componentes/editarrutina/editarrutina.module';
import { EditarperfilModule } from './componentes/editarperfil/editarperfil.module';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { EquiposModule } from './equipo/equipo.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getStorage, provideStorage } from '@angular/fire/storage';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, EquiposModule,EditarperfilModule,editarrutinaModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, provideFirebaseApp(() => initializeApp({"projectId":"conoce-eldeporte","appId":"1:654408239881:web:2e6e71367c8955372121d8","storageBucket":"conoce-eldeporte.appspot.com","apiKey":"AIzaSyANkZ2O66SwlD8cEfpr4hyD_TEoV9ip-ZM","authDomain":"conoce-eldeporte.firebaseapp.com","messagingSenderId":"654408239881","measurementId":"G-CL7JHWEBVW"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideFunctions(() => getFunctions()), provideMessaging(() => getMessaging()), provideStorage(() => getStorage())],
  bootstrap: [AppComponent],
})
export class AppModule {}
