import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private serverKey: string = environment.restApiKey; // Asegúrate de tener tu clave de servidor en el archivo de entorno
  private fcmUrl: string = 'https://fcm.googleapis.com/fcm/send';

  constructor(private http: HttpClient) {}

  enviarNotificacion(tokens: string[], notification: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `key=${this.serverKey}`
    });

    const body = {
      registration_ids: tokens,
      notification: {
        title: notification.tipo, // Título de la notificación
        body: notification.mensaje, // Mensaje de la notificación
      },
      data: {
        equipoId: notification.equipoId, // Puedes incluir más datos aquí si lo deseas
      }
    };

    return this.http.post(this.fcmUrl, body, { headers }).toPromise();
  }
}