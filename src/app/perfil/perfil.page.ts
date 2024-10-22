import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { AuthService } from '../servicios/auth.service'; // Importar el servicio de autenticación
import { getDownloadURL, ref, Storage } from '@angular/fire/storage';
import { User } from '@angular/fire/auth';
import { Equipos } from '../modelos/equipos.models';
import { FirestoreService } from '../servicios/firestore.service';
@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  usuarioNombre!: string;
  usuarioEdad!: number;
  usuarioEquipo: string = 'Sin equipo';
  usuarioCorreo!: string;
  usuarioFotoPerfil: string = 'https://www.w3schools.com/howto/img_avatar.png'; // Imagen por defecto
  equiposSeguidos: Equipos[] = [];
  constructor(
    private navController: NavController,
    private authService: AuthService, // Servicio de autenticación
    private firestore: Firestore, // Firestore para consultas
    private storage: Storage,
    private firestoreService: FirestoreService
  ) {}

  async ngOnInit() {
    this.obtenerDatosUsuario();
    const user = await this.authService.getCurrentUser();
    
    if (user) {
      const uid = user.uid; // Aquí puedes acceder a uid
      this.obtenerDatosEquiposSeguidos(uid);
    } else {
      console.log('No hay usuario autenticado, redirigiendo a la página de inicio de sesión...');
    }
  }
  
  
  

  obtenerDatosEquiposSeguidos(uid: string) {
    this.equiposSeguidos = []; // Inicializa la lista de equipos seguidos
  
    this.firestoreService.obtenerEquiposSeguidos(uid)
      .then(equiposIdsSeguidos => {
        if (equiposIdsSeguidos.length === 0) {
          console.log('El usuario no sigue a ningún equipo.');
          return; // Si no hay equipos, salir de la función
        }
  
        const promises = equiposIdsSeguidos.map(equipoId => 
          this.firestoreService.obtenerDatosEquipo(equipoId).then(equipoData => {
            if (equipoData) {
              this.equiposSeguidos.push(equipoData); // Almacenar los datos del equipo
            }
          }).catch(error => {
            console.error(`Error al obtener datos del equipo ${equipoId}:`, error);
          })
        );
  
        // Esperar a que todas las promesas se resuelvan
        return Promise.all(promises);
      })
      .then(() => {
        console.log('Equipos seguidos cargados:', this.equiposSeguidos);
      })
      .catch(error => {
        console.error('Error al obtener equipos seguidos:', error);
      });
  }
  
  
  
  
  

  async obtenerDatosUsuario() {
    try {
      const user: User | null = await this.authService.getCurrentUser(); 
      if (user) {
        const uid = user.uid;

        
        const userDocRef = doc(this.firestore, `usuarios/${uid}`);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const usuarioData = userDoc.data();
          this.usuarioNombre = `${usuarioData['nombre']} ${usuarioData['apellido']}`;
          this.usuarioEdad = this.calcularEdad(usuarioData['fechaNacimiento']); 
          this.usuarioEquipo = usuarioData['equipo'] || 'Sin equipo';
          this.usuarioCorreo = usuarioData['correo'];

          
          if (usuarioData['fotoPerfil']) {
            this.obtenerFotoPerfil(usuarioData['fotoPerfil']);
          }
        }
      }
    } catch (error) {
      console.error('Error obteniendo los datos del usuario: ', error);
    }
  }

  async obtenerFotoPerfil(fotoPerfilPath: string) {
    try {
      const storageRef = ref(this.storage, fotoPerfilPath);
      const url = await getDownloadURL(storageRef);
      this.usuarioFotoPerfil = url; 
    } catch (error) {
      console.error('Error al obtener la foto de perfil: ', error);
    
    }
  }

  calcularEdad(fechaNacimiento: any): number {
    if (fechaNacimiento) {
      
      const fechaNac = fechaNacimiento.toDate(); 
      const edadDifMs = Date.now() - fechaNac.getTime();
      const edadFecha = new Date(edadDifMs);
      return Math.abs(edadFecha.getUTCFullYear() - 1970);
    }
    return 0; 
  }
  

}
