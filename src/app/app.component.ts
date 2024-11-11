import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './servicios/auth.service'; 
import { Firestore } from '@angular/fire/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { NotificacionService } from './servicios/notificaciones-service.service';
import { async } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private notificacionService: NotificacionService) {}

  ngOnInit() {
    // Verifica la autenticación al iniciar la aplicación
    this.authService.verificarAutenticacion();
    this.notificacionService.initPushNotifications();
  }


}
