import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, onSnapshot } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  constructor(private firestore: Firestore) {}

  listenForNotifications(userId: string, callback: (notifications: any[]) => void) {
    const notificationsRef = collection(this.firestore, `usuarios/${userId}/notificaciones`);
    onSnapshot(notificationsRef, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(notifications);
    });
  }
}