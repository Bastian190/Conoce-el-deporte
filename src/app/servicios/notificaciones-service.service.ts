import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Firestore } from '@angular/fire/firestore';
import { OneSignal } from '@awesome-cordova-plugins/onesignal';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { AuthService } from './auth.service';
import { getAuth } from 'firebase/auth';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient) {}

 
} 