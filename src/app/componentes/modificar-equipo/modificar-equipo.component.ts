import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/servicios/auth.service';
import { Firestore, collection, collectionData, doc, updateDoc, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Component({
  selector: 'app-modificar-equipo',
  templateUrl: './modificar-equipo.component.html',
  styleUrls: ['./modificar-equipo.component.scss'],
})
export class ModificarEquipoComponent  implements OnInit {
  equipos: any[] = [];
   // Cambia esto al ID del usuario actual
  equipoSeleccionado: any;
  constructor(private authService: AuthService,private router: Router,private firestore: Firestore) { }

  ngOnInit() {
    if (this.authService.esAdministrador()) {
      console.log("Usuario con acceso de administrador");
      // Muestra funcionalidades de administrador
    } else {
      console.log("Usuario con acceso estándar");
      // Muestra funcionalidades estándar
    }
  }
  irAPaginaDestino() {
    this.router.navigate(['/tabs/perfil']);
  }
  
}
