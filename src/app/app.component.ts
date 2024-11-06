import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './servicios/auth.service'; 
import { PushNotifications } from '@capacitor/push-notifications';
import { Firestore } from '@angular/fire/firestore';
import { doc, setDoc } from 'firebase/firestore';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router,private firestore: Firestore) {}

  ngOnInit() {
    // Verifica la autenticación al iniciar la aplicación
    this.authService.verificarAutenticacion();
    this.initializeFCM();
  }
  initializeFCM() {
    PushNotifications.requestPermissions().then(result => {
        if (result.receive === 'granted') {
            PushNotifications.register();
        } else {
            console.error('Permission not granted for notifications');
        }
    });

    PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
        // Guarda el token en Firestore
        this.saveDeviceToken(token.value);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Notification received: ', notification);
        // Aquí puedes mostrar la notificación en tu UI o manejarla como prefieras
    });
}

saveDeviceToken(token: string) {
    // Aquí debes obtener el ID del usuario actual y guardar el token
    const userId = 'CURRENT_USER_ID'; // Reemplaza esto con la lógica para obtener el ID del usuario actual
    const tokenRef = doc(this.firestore, `usuarios/${userId}`);
    setDoc(tokenRef, { deviceToken: token }, { merge: true });
}
}
