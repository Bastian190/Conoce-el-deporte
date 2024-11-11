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
import { Router } from '@angular/router';
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
    public authService: AuthService, // Servicio de autenticación
    private firestore: Firestore, // Firestore para consultas
    private storage: Storage,
    private firestoreService: FirestoreService,
    private clipboard: Clipboard,
    private platform: Platform,
    private router: Router
  ) {}

  ngOnInit() {
    this.obtenerDatosUsuario();
    const user = this.authService.getCurrentUser();
    const uid = user ? user.uid : null;

    if (user && uid) {
      this.obtenerDatosEquiposSeguidosTiempoReal(uid); // Llamamos a la función para obtener los equipos seguidos en tiempo real
    } else {
      console.log('No hay usuario autenticado, redirigiendo a la página de inicio de sesión...');
      this.router.navigate(['']);
    }

    // Verificación de permisos de administrador
    if (this.authService.esAdministrador()) {
      console.log("Usuario con acceso de administrador");
      // Muestra funcionalidades de administrador
    } else {
      console.log("Usuario con acceso estándar");
      // Muestra funcionalidades estándar
    }
    
  }

  suscripcionEquiposSeguidos: any; // Para almacenar la suscripción y cancelarla si es necesario

ngOnDestroy() {
  if (this.suscripcionEquiposSeguidos) {
    this.suscripcionEquiposSeguidos(); // Llamada al unsubscribe para detener la escucha
  }
}

// Obtener los equipos seguidos en tiempo real
obtenerDatosEquiposSeguidosTiempoReal(uid: string) {
  this.suscripcionEquiposSeguidos = this.firestoreService.obtenerEquiposSeguidos(uid)
    .subscribe(async (equiposIdsSeguidos: string[]) => {
      console.log('Equipos seguidos IDs en tiempo real:', equiposIdsSeguidos);

      if (equiposIdsSeguidos.length === 0) {
        console.log('El usuario no sigue a ningún equipo.');
        this.equiposSeguidos = []; // Limpia la lista si no hay equipos
        return;
      }

      // Usa Promise.all para cargar los datos de los equipos seguidos
      const equiposData = await Promise.all(
        equiposIdsSeguidos.map(async (equipoId) => {
          try {
            const equipoData = await this.firestoreService.obtenerDatosEquipo(equipoId);
            if (equipoData) {
              equipoData.id = equipoId;
              return equipoData;
            }
            return null; // Retorna null si no se pudo cargar el equipo
          } catch (error) {
            console.error(`Error al obtener datos del equipo ${equipoId}:`, error);
            return null;
          }
        })
      );

      // Filtra los valores null o undefined y actualiza `equiposSeguidos`
      this.equiposSeguidos = equiposData.filter((equipo): equipo is Equipos => equipo !== null && equipo !== undefined);
      console.log('Equipos seguidos actualizados en tiempo real:', this.equiposSeguidos);
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
