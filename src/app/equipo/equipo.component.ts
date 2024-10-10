import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; 
import { FirestoreService } from '../servicios/firestore.service';
import { Equipos } from '../modelos/equipos.models';
import { ChangeDetectorRef } from '@angular/core';
import { Logros } from '../modelos/equipos.models'; // Importa el modelo de logros
import { Partidos } from '../modelos/equipos.models'; // Importa el modelo de partidos
import { Timestamp } from 'firebase/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-equipo',
  templateUrl: './equipo.component.html',
  styleUrls: ['./equipo.component.scss'],
})
export class EquipoComponent  implements OnInit {
  alertButtons = ['aceptar'];
  equipo: Equipos | null = null;
  nombreEquipo: string | null = null;
  logros: Logros[]=[];
  partidos: Partidos[]=[];
 // Array para almacenar los partidos
  constructor(private router: Router, private firestoreService:FirestoreService, private route: ActivatedRoute,) { }

  // Método para navegar a la página
  irAPaginaDestino() {
    this.router.navigate(['/tabs/Buscar']);
  }
  ngOnInit() {
  
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.equipo = navigation.extras.state['equipo'];
      if (this.equipo) {
        const nombreEquipo = this.equipo.nombre_equipo;
        console.log(this.equipo.nombre_equipo)
        this.firestoreService.getEquipoPorNombre(nombreEquipo).subscribe(equipoId => {
          if (equipoId) {
            console.log('ID del equipo:', equipoId);
    
            // Obtener logros del equipo por equipoId
            this.firestoreService.getLogrosPorEquipo(equipoId).subscribe(logros => {
              this.logros = logros; // this.logros debería ser del tipo Logros[]
              console.log('Logros:', this.logros);
          });

          // Obtener partidos del equipo por equipoId
          this.firestoreService.getPartidosPorEquipo(equipoId).subscribe(partidos => {
              this.partidos = partidos;
              console.log('Partidos:', this.partidos); // Verifica si partidos tiene datos
          });
          } else {
            console.log('No se encontró el equipo');
          }
        });
      }
      
    }
  }
  
  public alertInputs = [
    {
      label: 'Solo actividades',
      type: 'radio',
      value: 'actividades',
    },
    {
      label: 'Solo partidos',
      type: 'radio',
      value: 'partidos',
    },
    {
      label: 'Ambos',
      type: 'radio',
      value: 'todos',
    },
  ];

  // Método para formatear la fecha
  convertTimestampToDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
  }




}
