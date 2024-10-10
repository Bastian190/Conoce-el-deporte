import { NavController } from '@ionic/angular';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { FirestoreService } from '../servicios/firestore.service';
import { Tipo_rutina } from '../modelos/equipos.models'; 

@Component({
  selector: 'app-registro-rutina',
  templateUrl: './registro-rutina.component.html',
  styleUrls: ['./registro-rutina.component.scss'],
})
export class RegistroRutinaComponent implements OnInit {

  rutina: Tipo_rutina[] = [];

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private firestoreService: FirestoreService,
    private cdr: ChangeDetectorRef
  ) {}

  inicio() {
    console.log("entra");
    this.router.navigate(['/tabs/Inicio']);
  }

  ngOnInit() {
    // Cargar rutinas de la subcolección al inicializar el componente
    this.cargarRutinas();
  }

  cargarRutinas() {
    // Reemplaza 'coleccionPrincipal', 'documento', y 'subcoleccion' con los valores correctos
    const coleccionPrincipal = 'Rutinas'; // Cambia por el nombre de tu colección
    const documento = 'PlyuiOZ5ex4zKxUcZGTO'; // Cambia por el ID del documento
    const subcoleccion = 'Tipo_rutina'; // Cambia por el nombre de la subcolección

    this.firestoreService.getSubdocumentos<Tipo_rutina>(coleccionPrincipal, documento, subcoleccion).subscribe(data => {
      this.rutina = data;
      console.log("Rutinas cargadas:", this.rutina);
      this.cdr.detectChanges(); // Llama a detectChanges si es necesario
    });
  }
}
