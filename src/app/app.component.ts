import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './servicios/auth.service'; 
import { Firestore } from '@angular/fire/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';

declare var window: any;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router,private firestore: Firestore,private platform: Platform) {}

  ngOnInit() {
    // Verifica la autenticación al iniciar la aplicación
    this.authService.verificarAutenticacion();
  }


}

