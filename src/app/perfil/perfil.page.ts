import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Firestore, doc, getDoc,collection } from '@angular/fire/firestore';
import { AuthService } from '../servicios/auth.service'; // Importar el servicio de autenticación
import { getDownloadURL, ref, Storage } from '@angular/fire/storage';
import { User } from '@angular/fire/auth';
import { Equipos } from '../modelos/equipos.models';
import { FirestoreService } from '../servicios/firestore.service';
import { Clipboard } from '@awesome-cordova-plugins/clipboard/ngx';
import { Platform } from '@ionic/angular';
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
  mostrarCorreo: boolean = false; // Nueva variable para controlar el toggle

  constructor(
    private navController: NavController,
    private authService: AuthService, // Servicio de autenticación
    private firestore: Firestore, // Firestore para consultas
    private storage: Storage,
    private firestoreService: FirestoreService,
    private clipboard: Clipboard,
    private platform: Platform
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
    console.log(this.equiposSeguidos);
    
  }

  async obtenerDatosEquiposSeguidos(uid: string) {
    this.equiposSeguidos = []; // Inicializa la lista de equipos seguidos

    this.firestoreService.obtenerEquiposSeguidos(uid)
        .then(equiposIdsSeguidos => {
            console.log('Equipos seguidos IDs:', equiposIdsSeguidos); // Verifica los IDs

            if (equiposIdsSeguidos.length === 0) {
                console.log('El usuario no sigue a ningún equipo.');
                return; // Si no hay equipos, salir de la función
            }

            const promises = equiposIdsSeguidos.map(equipoId =>
                this.firestoreService.obtenerDatosEquipo(equipoId).then(equipoData => {
                    if (equipoData) {
                        equipoData.id = equipoId; // Asegúrate de que el id esté presente
                        this.equiposSeguidos.push(equipoData);
                        console.log('Equipo cargado:', equipoData);
                    }
                }).catch(error => {
                    console.error(`Error al obtener datos del equipo ${equipoId}:`, error);
                })
            );

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
  copyEmailToClipboard() {
    const email = this.usuarioCorreo;
    
    if (!email) {
      console.error('Correo no disponible para copiar');
      return;
    }
  
    // Comprobar si estamos en un dispositivo Cordova o en un navegador
    if (this.platform.is('cordova')) {
      this.clipboard.copy(email).then(() => {
        console.log('Correo copiado al portapapeles');
      }).catch((error) => {
        console.error('Error al copiar el correo:', error);
      });
    } else {
      // Usar el método del navegador
      navigator.clipboard.writeText(email).then(() => {
        console.log('Correo copiado al portapapeles (navegador)');
      }).catch((error) => {
        console.error('Error al copiar el correo en el navegador:', error);
      });
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
  dejarDeSeguir(equipoId: string) {
    console.log(`Intentando dejar de seguir el equipo con ID: ${equipoId}`); // Verifica el ID aquí

    // Asegúrate de que el ID no sea undefined
    if (!equipoId) {
        console.error('El ID del equipo es undefined. Verifica la llamada a dejarDeSeguir.');
        return; // Sal de la función si el ID no es válido
    }

    const user = this.authService.getCurrentUser();
    if (user) {
        const uid = user.uid;
        this.firestoreService.dejarDeSeguirEquipo(uid, equipoId)
            .then(() => {
                // Filtrar el equipo de la lista de equiposSeguidos
                this.equiposSeguidos = this.equiposSeguidos.filter(equipo => equipo.id !== equipoId);
                console.log(`El equipo con ID ${equipoId} ha sido eliminado de la lista de equipos seguidos.`);
            })
            .catch(error => {
                console.error('Error al dejar de seguir el equipo:', error);
            });
    } else {
        console.error('No hay un usuario autenticado para eliminar el equipo seguido.');
    }
}


  
  
  
  
  
}
