import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PushNotifications } from '@capacitor/push-notifications';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import {Auth} from '@angular/fire/auth';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  async initPushNotifications() {


    if (Capacitor.isNativePlatform()) {
      PushNotifications.requestPermissions().then(result => {
        if (result.receive === 'granted') {
          PushNotifications.register();
        }
      });

      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error: ', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ', notification);
      });
    } else {
      console.warn("PushNotifications no está disponible en la plataforma web.");
    }
  }
  private async saveToken(userId: string, token: string) {
    try {
      const tokenRef = doc(this.firestore, `usuarios/${userId}`);
      await setDoc(tokenRef, { fcmToken: token }, { merge: true });
      console.log('Token guardado exitosamente en Firestore');
    } catch (error) {
      console.error('Error al guardar el token en Firestore:', error);
    }
  }
}