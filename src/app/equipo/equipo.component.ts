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
  public tipoNotificacion: string | null = null; // Valor por defecto
  equipo: Equipos | null = null;
  nombreEquipo: string | null = null;
  logros: Logros[]=[];
  partidos: Partidos[]=[];
  esEquipoSeguido: { [equipoId: string]: boolean } = {};
 // Array para almacenar los partidos
  constructor(private router: Router, private firestoreService:FirestoreService, private route: ActivatedRoute,public authService: AuthService) { }

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
    if (this.authService.esAdministrador()) {
      console.log("Usuario con acceso de administrador");
      // Muestra funcionalidades de administrador
    } else {
      console.log("Usuario con acceso estándar");
      // Muestra funcionalidades estándar
    }
  }
  
  private obtenerLogrosYPartidos(equipoId: string) {
    // Obtener logros del equipo por equipoId
    this.firestoreService.getLogrosPorEquipo(equipoId).subscribe(logros => {
      this.logros = logros.map(logro => ({
        ...logro,
        fecha: logro.fecha ? new Date(logro.fecha) : null // Convertir cadena a Date
      }));
      console.log('Logros:', this.logros);
    });
  
    // Obtener partidos del equipo por equipoId
    this.firestoreService.getPartidosPorEquipo(equipoId).subscribe(partidos => {
      this.partidos = partidos; // Asegúrate de que los partidos también se manejen correctamente
      console.log('Partidos:', this.partidos);
    });
  }
  
  
  // Definición de botones e inputs del alert
  public alertButtons = [
    {
      text: 'Aceptar',
      handler: (data: string) => {
        this.tipoNotificacion = data; // Asigna la opción seleccionada a `tipoNotificacion`
        
        if (this.tipoNotificacion) {
          this.seguirEquipo(this.tipoNotificacion); // Llama a seguirEquipo con la opción seleccionada
        }
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

  async seguirEquipo(tipoNotificacion: string) {
    const user = this.authService.getCurrentUser();
    const uid = user ? user.uid : null;
  
    if (this.equipo && this.equipo.id && uid) {
      try {
        // Guardar el equipo como seguido en Firestore con la notificación seleccionada
        await this.firestoreService.agregarEquipoSeguido(uid, this.equipo.id, tipoNotificacion);
        console.log('Equipo seguido guardado en la base de datos');
        
        // Actualizar el estado para que se muestre el mensaje "Ya sigues a este equipo."
        this.esEquipoSeguido[this.equipo.id] = true;
      } catch (error) {
        console.error('Error al seguir el equipo:', error);
      }
    } else {
      console.error('ID del equipo o UID no están definidos');
    }
  }
  
  
  async verificarEquipoSeguido(uid: string | null) {
    if (this.equipo && this.equipo.id && uid) {
      try {
        const existe = await this.firestoreService.verificarEquipoSeguido(uid, this.equipo.id);
        this.esEquipoSeguido[this.equipo.id] = existe; // Guarda el estado de seguimiento específico del equipo
      } catch (error) {
        console.error('Error al verificar si el equipo está seguido:', error);
      }
    } else {
      console.error('UID o equipoId no están definidos');
    }
  }
  
  
  
  

  
}