import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { OneSignal } from '@awesome-cordova-plugins/onesignal';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';

import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { getAuth } from 'firebase/auth';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private serverKey: string = environment.restApiKey; // Asegúrate de tener tu clave de servidor en el archivo de entorno
  private fcmUrl: string = 'https://fcm.googleapis.com/fcm/send';

  // Inicializa OneSignal y guarda el token de notificación
  async obtenerYGuardarToken() {
    try {
      // Obtén el token de OneSignal
      OneSignal.getIds().then((ids) => {
        const token = ids.userId;
        if (token) {
          console.log('Token de OneSignal:', token);

          // Obtener el UID del usuario autenticado
          const user = getAuth().currentUser;
          if (user) {
            // Guarda el token de OneSignal en Firestore bajo el usuario autenticado
            const userRef = doc(this.firestore, `usuarios/${user.uid}`);
            setDoc(userRef, { notificationToken: token }, { merge: true }).then(() => {
              console.log('Token guardado correctamente en Firestore');
            }).catch((error) => {
              console.error('Error guardando el token en Firestore:', error);
            });
          } else {
            console.log('Usuario no autenticado');
          }
        } else {
          console.log('No se pudo obtener el token de OneSignal');
        }
      });
    } catch (error) {
      console.error('Error al obtener el token de OneSignal:', error);
    }
  }
}