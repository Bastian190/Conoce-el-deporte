import { Inject, Injectable, Injector } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PushNotifications } from '@capacitor/push-notifications';
import { collection, doc, Firestore, getDocs, setDoc } from '@angular/fire/firestore';
import {Auth, user} from '@angular/fire/auth';
import { Capacitor } from '@capacitor/core';
import { auth } from 'firebase-admin';
;
import { Action } from 'rxjs/internal/scheduler/Action';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { lastValueFrom } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  constructor(@Inject(Firestore) private firestore: Firestore, private http: HttpClient) {
    
  }
  private apiURl ='http://localhost:3000/send-notification';
  // Este método puede inicializar la notificación (si ya no lo tienes en el AuthService)
  // En el servicio de notificaciones (cliente)
  async initPushNotifications() {
    if (Capacitor.isNativePlatform()) {
      const permissionStatus = await PushNotifications.requestPermissions();
      if (permissionStatus.receive === 'granted') {
        PushNotifications.register();
      } else {
        console.log('Permisos de notificación denegados');
      }

      // Listener para obtener el token
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
        this.saveToken(token.value);
      });

      // Listener para errores de registro
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error: ', error);
      });

      // Listener para notificaciones recibidas
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ', notification);
      });
    } else {
      console.warn('PushNotifications no está disponible en la plataforma web.');
    }
  }



  async saveToken(userId: string) {
    // Escucha el evento de registro para obtener el token
    PushNotifications.addListener('registration', async (token) => {
      try {
        // Guardamos el token en Firestore
        const userRef = doc(this.firestore, `usuarios/${userId}`);
        await setDoc(userRef, { fcmToken: token.value }, { merge: true });
        console.log('Token guardado exitosamente en Firestore');
      } catch (error) {
        console.error('Error al guardar el token en Firestore:', error);
      }
    });
  }


  async enviarNotificacionesMasivas(title: string, mensaje: string) {
    const usuarioRef = collection(this.firestore, 'usuarios');
    const usuariosSnapshot = await getDocs(usuarioRef);
    let tokens: string[] = [];
  
    // Extraemos los tokens de los usuarios
    for (const usuarioDoc of usuariosSnapshot.docs) {
      const usuarioData = usuarioDoc.data();
      const fcmToken = usuarioData['fcmToken'];
      if (fcmToken) {
        tokens.push(fcmToken);
      }
    }
  
    // Si no se encuentran tokens, mostramos un mensaje y retornamos
    if (tokens.length === 0) {
      console.log('No hay usuarios para mandar notificación');
      return;
    }
  
    try {
      // Enviamos la solicitud POST al backend
      const response: HttpResponse<any> = await lastValueFrom(this.http.post(this.apiURl, {
        tokens: tokens,
        Notification: {
          title: title,
          body: mensaje
        },
      }, { observe: 'response' }));
  
      // Verificamos si la respuesta es exitosa
      if (response.status === 200) {
        console.log('Notificaciones enviadas exitosamente:', response);
      } else {
        console.log('Respuesta inesperada del servidor:', response);
      }
    } catch (error: any) {
      if (error.status) {
        console.error('Error al enviar notificaciones. Código de error:', error.status);
        console.error('Mensaje de error:', error.message);
      } else {
        console.error('Error al enviar notificaciones:', error);
      }
    }
  }
  

  


}