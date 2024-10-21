import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; 
import { FirestoreService } from '../servicios/firestore.service';
import { Equipos } from '../modelos/equipos.models';
import { ChangeDetectorRef } from '@angular/core';
import { Logros } from '../modelos/equipos.models'; // Importa el modelo de logros
import { Partidos } from '../modelos/equipos.models'; // Importa el modelo de partidos
import { Timestamp } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-equipo',
  templateUrl: './equipo.component.html',
  styleUrls: ['./equipo.component.scss'],
})

export class EquipoComponent  implements OnInit {
  tipoNotificacion: string = 'todos'; // Valor por defecto
  equipo: Equipos | null = null;
  nombreEquipo: string | null = null;
  logros: Logros[]=[];
  partidos: Partidos[]=[];
  esEquipoSeguido: boolean = false;
 // Array para almacenar los partidos
  constructor(private router: Router, private firestoreService:FirestoreService, private route: ActivatedRoute,private authService: AuthService) { }

  // Método para navegar a la página
  irAPaginaDestino() {
    this.router.navigate(['/tabs/Buscar']);
  }
  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const user = this.authService.getCurrentUser();
    const uid = user ? user.uid : null;

    if (uid) { // Asegúrate de que uid no sea null
        this.verificarEquipoSeguido(uid); // Verifica si el equipo está seguido
    } else {
        console.error('El UID del usuario es null');
      }
    if (navigation?.extras.state) {
      this.equipo = navigation.extras.state['equipo'];
      if (this.equipo) {
        console.log('Equipo:', this.equipo);
        const nombreEquipo = this.equipo.nombre_equipo;
        const user = this.authService.getCurrentUser();
        const uid = user ? user.uid : null;
  
        this.firestoreService.getEquipoPorNombre(nombreEquipo).subscribe(equipoId => {
          if (equipoId) {
            console.log('ID del equipo:', equipoId);
            if (this.equipo) {
              this.equipo.id = equipoId; // Asigna el ID del equipo aquí
              this.verificarEquipoSeguido(uid); // Verifica si el equipo está seguido
              this.obtenerLogrosYPartidos(equipoId);
            }
          } else {
            console.log('No se encontró el equipo');
          }
        });
      }
    }
  }
  
  private obtenerLogrosYPartidos(equipoId: string) {
    // Obtener logros del equipo por equipoId
    this.firestoreService.getLogrosPorEquipo(equipoId).subscribe(logros => {
      this.logros = logros;
      console.log('Logros:', this.logros);
    });
  
    // Obtener partidos del equipo por equipoId
    this.firestoreService.getPartidosPorEquipo(equipoId).subscribe(partidos => {
      this.partidos = partidos;
      console.log('Partidos:', this.partidos);
    });
  }
  
  public alertButtons = [
    {
      text: 'Aceptar',
      handler: (data: string) => {
        // Llama al método para seguir el equipo y guardar la selección
        this.tipoNotificacion = data; // Asignar la selección del usuario
        this.seguirEquipo(this.tipoNotificacion);
      }
    }
  ];
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

  seguirEquipo(tipoNotificacion: string) {
    const user = this.authService.getCurrentUser(); // Obtener el usuario actual
    const uid = user ? user.uid : null; // Asegúrate de que el usuario existe
  
    if (this.equipo && this.equipo.id && uid) {
      this.firestoreService.agregarEquipoSeguido(uid, this.equipo.id, tipoNotificacion)
        .then(() => {
          console.log('Equipo seguido guardado en la base de datos');
        })
        .catch(error => {
          console.error('Error al seguir el equipo:', error);
        });
    } else {
      console.error('ID del equipo o UID no están definidos');
    }
  }
  verificarEquipoSeguido(uid: string | null) {
    if (this.equipo && this.equipo.id) {
      if (uid) { // Solo verifica si uid no es null
        this.firestoreService.verificarEquipoSeguido(uid, this.equipo.id)
          .then(existe => {
            this.esEquipoSeguido = existe; // Actualiza la propiedad según el resultado
          })
          .catch(error => {
            console.error('Error al verificar si el equipo está seguido:', error);
          });
      } else {
        console.error('El UID del usuario es null, no se puede verificar el equipo seguido');
      }
    } else {
      console.error('Equipo o ID del equipo no están definidos');
    }
  }
  
  

  
}

