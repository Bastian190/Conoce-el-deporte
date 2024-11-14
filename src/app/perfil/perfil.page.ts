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
import { DocumentReference, DocumentSnapshot, getDocs, limit, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { ChangeDetectorRef } from '@angular/core';
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
  seguidoresEquipo: any[] = [];
  constructor(
    private navController: NavController,
    public authService: AuthService, // Servicio de autenticación
    private firestore: Firestore, // Firestore para consultas
    private storage: Storage,
    private firestoreService: FirestoreService,
    private clipboard: Clipboard,
    private platform: Platform,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.obtenerDatosUsuario();  // Esto asumo que obtiene los datos del usuario actual
  
    const user = this.authService.getCurrentUser();
    const uid = user ? user.uid : null;
  
    if (user && uid) {
      // Obtener la preferencia de mostrar correo desde el servicio
      this.mostrarCorreo = await this.firestoreService.obtenerPreferenciaCorreo(uid);
  
      // Obtener los datos de los equipos seguidos en tiempo real
      this.obtenerDatosEquiposSeguidosTiempoReal(uid);
  
      if (this.authService.esAdministrador()) {
        console.log("Usuario con acceso de administrador");
  
        // Llamada para obtener los seguidores del equipo administrado
        this.mostrarSeguidoresEquiposAdministrados(uid);
      } else {
        console.log("Usuario con acceso estándar");
      }
    } else {
      console.log('No hay usuario autenticado, redirigiendo a la página de inicio de sesión...');
      this.router.navigate(['login']);
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
  copyEmailToClipboard(correo: string) {
    if (!correo) {
      console.error('Correo no disponible para copiar');
      return;
    }

    // Comprobar si estamos en un dispositivo Cordova o en un navegador
    if (this.platform.is('cordova')) {
      this.clipboard.copy(correo).then(() => {
        console.log('Correo copiado al portapapeles');
      }).catch((error) => {
        console.error('Error al copiar el correo:', error);
      });
    } else {
      // Usar el método del navegador
      navigator.clipboard.writeText(correo).then(() => {
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

  mostrarSeguidoresEquiposAdministrados(uid: string) {
    // Obtén los equipos administrados por el usuario
    const adminEquiposRef = collection(this.firestore, `usuarios/${uid}/administracion`);
  
    const unsubscribe = onSnapshot(adminEquiposRef, (snapshot) => {
      // Revisar si encontramos algún documento en la subcolección de administración
      if (snapshot.empty) {
        console.log("No hay equipos administrados para este usuario.");
        return;
      }
  
      snapshot.docs.forEach((doc) => {
        // Obtener la referencia al equipo desde la subcolección
        const equipoRef = doc.data()['id_equipo'];   // Campo 'id_equipo' es una referencia al documento de equipo
        console.log("Referencia del equipo administrado:", equipoRef);
        
        // Acceder al equipo mediante la referencia y obtener sus detalles
        getDoc(equipoRef).then((equipoDoc) => {
          if (equipoDoc.exists()) {
            const equipoData = equipoDoc.data();
            console.log("Datos del equipo administrado:", equipoData);
            
            // Ahora puedes hacer algo con los datos del equipo (por ejemplo, mostrar seguidores)
            this.obtenerSeguidoresDelEquipo(equipoRef);   // Función para obtener seguidores del equipo
          } else {
            console.log("El equipo administrado no existe.");
          }
        }).catch((error) => {
          console.log("Error al obtener el equipo administrado:", error);
        });
      });
    }, (error) => {
      console.log("Error al obtener los equipos administrados:", error);
    });
  
    // Limpiar la suscripción cuando ya no se necesite
    return () => unsubscribe();
  }
  
  async obtenerSeguidoresDelEquipo(equipoRef: DocumentReference) {
    try {
        const equipoId = equipoRef.id; // ID del equipo administrado
        console.log("Buscando seguidores para el equipo con ID:", equipoId);

        // 1. Obtenemos los usuarios que siguen equipos (limitamos el número de resultados por rendimiento)
        const usuariosRef = collection(this.firestore, 'usuarios');
        const usuariosQuery = query(usuariosRef, limit(50)); // Limitamos la consulta para obtener solo los primeros 50 usuarios
        const usuariosSnapshot = await getDocs(usuariosQuery);

        // 2. Almacenamos los seguidores
        const seguidores: any[] = [];

        // 3. Iteramos sobre los usuarios obtenidos
        for (const usuarioDoc of usuariosSnapshot.docs) {
            const usuarioId = usuarioDoc.id;
            console.log("Revisando el usuario con ID:", usuarioId);

            // 4. Accedemos directamente a la subcolección 'equiposSeguidos' de cada usuario
            const equiposSeguidosRef = collection(this.firestore, `usuarios/${usuarioId}/equiposSeguidos`);
            const equiposSeguidosSnapshot = await getDocs(equiposSeguidosRef);

            // 5. Buscamos si el usuario sigue el equipo administrado (filtrando por ID)
            const equipoSeguido = equiposSeguidosSnapshot.docs.find((equipoDoc) => equipoDoc.data()['equipoId'] === equipoId);

            if (equipoSeguido) {
                console.log(`El usuario ${usuarioId} es seguidor del equipo con ID ${equipoId}`);

                // 6. Obtener la preferencia de "mostrarCorreo" para este usuario desde la subcolección 'configCorreo'
                const usuarioConfigRef = doc(this.firestore, `usuarios/${usuarioId}/configCorreo/muestraCorreo`);
                const usuarioConfigSnapshot = await getDoc(usuarioConfigRef);

                // 7. Obtenemos la preferencia de "mostrarCorreo" si existe, de lo contrario se mantiene en false
                const mostrarCorreo = usuarioConfigSnapshot.exists() ? usuarioConfigSnapshot.data()?.['mostrarCorreo'] : false;

                // 8. Obtener el puntaje de este usuario desde la subcolección 'puntajes'
                const usuarioPuntajesRef = collection(this.firestore, `usuarios/${usuarioId}/puntajes`);
                const usuarioPuntajesSnapshot = await getDocs(usuarioPuntajesRef);

                // 9. Asumimos que cada usuario tiene un solo documento en la subcolección 'puntajes', y extraemos el puntaje
                let puntos = 0;
                if (!usuarioPuntajesSnapshot.empty) {
                    const puntajeDoc = usuarioPuntajesSnapshot.docs[0]; // Suponiendo que hay un solo documento con el puntaje
                    puntos = puntajeDoc.data()['puntos'] || 0; // Obtén el campo 'puntos', si existe, o usa 0 por defecto
                }

                // 10. Agregar la preferencia de correo y el puntaje al objeto del seguidor
                const seguidor = usuarioDoc.data();
                seguidor['mostrarCorreo'] = mostrarCorreo;
                seguidor['puntos'] = puntos; // Añadimos el puntaje al objeto del seguidor

                // 11. Añadimos el seguidor a la lista
                seguidores.push(seguidor);
            }
        }

        // 12. Actualizamos la lista de seguidores en el componente
        this.seguidoresEquipo = seguidores;
        this.cdr.markForCheck();

        if (this.seguidoresEquipo.length === 0) {
            console.log("Este equipo no tiene seguidores.");
        } else {
            console.log("Lista de seguidores del equipo:", this.seguidoresEquipo);
        }
    } catch (error) {
        console.error("Error al obtener seguidores del equipo:", error);
    }
}


 


async cargarPreferenciaCorreo(uid: string) {
  try {
    const usuarioDocRef = doc(this.firestore, `usuarios/${uid}/preferencias/correo`);
    const usuarioDoc = await getDoc(usuarioDocRef);
    
    if (usuarioDoc.exists()) {
      // Cargar el valor guardado para mostrarCorreo
      this.mostrarCorreo = usuarioDoc.data()['mostrarCorreo'] || false;
    } else {
      console.log("No se encontraron preferencias de correo para este usuario.");
      this.mostrarCorreo = false; // Valor por defecto si no existe preferencia
    }
  } catch (error) {
    console.error("Error al cargar la preferencia de correo:", error);
  }
}
async guardarPreferenciaCorreo() {
  const user = this.authService.getCurrentUser();
  const uid = user ? user.uid : null;

  if (uid) {
    try {
      // Guardar la preferencia usando el servicio
      await this.firestoreService.guardarPreferenciaCorreo(uid, this.mostrarCorreo);
      console.log("Preferencia de correo guardada:", this.mostrarCorreo);
    } catch (error) {
      console.error("Error al guardar la preferencia de correo:", error);
    }
  } else {
    console.log('Usuario no autenticado, no se puede guardar la preferencia de correo.');
  }
}


    
  
  
  

  
  
  
}
