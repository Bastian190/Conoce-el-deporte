import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/servicios/auth.service';
import { Firestore, collection, collectionData, doc, updateDoc, query, where, getDoc, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
@Component({
  selector: 'app-modificar-equipo',
  templateUrl: './modificar-equipo.component.html',
  styleUrls: ['./modificar-equipo.component.scss'],
})
export class ModificarEquipoComponent  implements OnInit {
  equipos: any[] = [];
  campoSeleccionado: string = ''; 
  campoSeleccionado2:string='';
  nuevoValor: string = ''; 
  equipoSeleccionado: any = {};
  logros: any[] = [];
  partidos:any[]=[];
  logroSeleccionadoId!: string;
  partidoSeleccionadoId!: string;
  constructor(private authService: AuthService,private router: Router,private firestore: Firestore) { }

  ngOnInit() {
    if (this.authService.esAdministrador()) {
      console.log("Usuario con acceso de administrador");
      // Muestra funcionalidades de administrador
    } else {
      console.log("Usuario con acceso estándar");
      // Muestra funcionalidades estándar
    }
    this.obtenerEquiposAdministrados();
    
  }
  irAPaginaDestino() {
    this.router.navigate(['/tabs/perfil']);
  }
  mostrarToast(mensaje: string, color: string) {
    console.log(mensaje); // Esto es solo un ejemplo, puedes reemplazarlo
  }
  verificarAutenticacion() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // Usuario autenticado, carga los objetivos
        this.obtenerEquiposAdministrados();
      } else {
        // Usuario no autenticado, redirige a inicio de sesión
        this.authService.signOut(); // Cierra la sesión si es necesario
        // Aquí puedes redirigir al usuario a la página de login
      }
    });
  }
  async obtenerEquiposAdministrados() {
    const currentUser = this.authService.getCurrentUser();
  
    if (!currentUser) {
      this.mostrarToast('Debes iniciar sesión para ver tu rutina.', 'warning');
      return; // Salir si no hay usuario
    }
  
    const adminCollection = collection(this.firestore, `usuarios/${currentUser.uid}/administracion`);
  
    // Suscribirse a los datos de la colección de administración
    collectionData(adminCollection, { idField: 'id' }).subscribe({
      next: async (administracion) => {
        this.equipos = []; // Limpiar la lista de equipos antes de cargar nuevos datos
        
        // Recorremos cada documento de administración
        for (const docAdmin of administracion) {
          const equipoRef = docAdmin['id_equipo'];
          
          
          if (equipoRef && equipoRef.id) {
            const equipoId = equipoRef.id; // Obtén el ID de la referencia
            console.log(`Buscando equipo con ID: ${equipoId}`); // Log para depuración
  
            const equipoDocRef = doc(this.firestore, `Equipos/${equipoId}`);
            const equipoDoc = await getDoc(equipoDocRef);
            console.log(equipoDocRef)
            if (equipoDoc.exists()) {
              const equipoData = equipoDoc.data();
              // Asegúrate de que equipoData sea un objeto antes de usar el operador spread
              if (equipoData) {
                this.equipos.push({ id: equipoDoc.id, ...equipoData }); // Agregamos el equipo a la lista
                console.log(`Equipo encontrado: ${equipoData['nombre']}`); // Log para confirmar el equipo
              } else {
                console.error("Los datos del equipo son nulos o indefinidos.");
              }
            } else {
              console.error(`El documento del equipo con ID ${equipoId} no existe.`); // Log de error
            }
          } else {
            console.error("El ID del equipo es inválido.");
          }
        }
  
        console.log('Equipos administrados: ', this.equipos); // Para verificar que se están cargando correctamente
      },
      error: (error) => {
        console.error("Error al obtener equipos: ", error);
        this.mostrarToast('Ocurrió un error al obtener los equipos.', 'danger');
      }
    });
  }
  async cargarLogros() {
    console.log("Entrando a cargarLogros()");

    try {
        // Verifica si equipoSeleccionado y su id están definidos
        const equipoId = this.equipoSeleccionado?.id;
        
        if (!equipoId) {
            console.warn("ID del equipo no está definido. Asegúrate de seleccionar un equipo antes de cargar logros.");
            return;
        }

        const logrosRef = collection(this.firestore, `Equipos/${equipoId}/Logros`);
        console.log("Obteniendo documentos de:", logrosRef.path); // Verifica la ruta

        const logrosSnapshot = await getDocs(logrosRef);

        if (logrosSnapshot.empty) {
            console.warn("No se encontraron documentos en la colección 'Logros' para el equipo con ID:", equipoId);
        } else {
            this.logros = logrosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Documentos obtenidos:", this.logros);
        }
    } catch (error) {
        console.error("Error al obtener logros:", error);
    }
}


  seleccionarLogro(logroId: string) {
    this.logroSeleccionadoId = logroId; // Almacena el ID del logro seleccionado
  }
  async cargarPartidos() {
    

    try {
        // Verifica si equipoSeleccionado y su id están definidos
        const equipoId = this.equipoSeleccionado?.id;
        
        if (!equipoId) {
            console.warn("ID del equipo no está definido. Asegúrate de seleccionar un equipo antes de cargar logros.");
            return;
        }

        const partidosRef = collection(this.firestore, `Equipos/${equipoId}/Partidos`);
        console.log("Obteniendo documentos de:", partidosRef.path); // Verifica la ruta

        const partidosSnapshot = await getDocs(partidosRef);

        if (partidosSnapshot.empty) {
            console.warn("No se encontraron documentos en la colección 'Partidos' para el equipo con ID:", equipoId);
        } else {
            this.partidos = partidosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Documentos obtenidos:", this.partidos);
        }
    } catch (error) {
        console.error("Error al obtener partidos:", error);
    }
}
seleccionarPartido(logroId: string) {
  this.partidoSeleccionadoId = logroId; // Almacena el ID del logro seleccionado
}
  
  seleccionarEquipo(equipo: any) {
    this.equipoSeleccionado = { ...equipo }; 
    this.cargarLogros()
    this.cargarPartidos()// Clona el equipo seleccionado
    console.log('Equipo seleccionado: ', this.equipoSeleccionado); // Para verificar
  }
  editarEquipo() {
    const currentUser = this.authService.getCurrentUser();

    // Verificar que todos los campos requeridos estén completados
    if (!currentUser || !this.equipoSeleccionado || !this.nuevoValor || !this.campoSeleccionado) {
        console.warn("Completa todos los campos requeridos.");
        console.log(currentUser);
        console.log(this.equipoSeleccionado);
        console.log('Campo seleccionado:', this.campoSeleccionado);
        console.log('Nuevo valor:', this.nuevoValor);
        return;
    }

    const equipoId = this.equipoSeleccionado.id; // Obtén el ID del equipo que deseas editar
    const equipoRef = doc(this.firestore, `Equipos/${equipoId}`);

    if (this.campoSeleccionado == 'descripcion' || this.campoSeleccionado == 'lugar') {
        // Actualizar los campos principales del equipo
        updateDoc(equipoRef, {
            [this.campoSeleccionado]: this.nuevoValor // Utiliza el campo seleccionado para actualizar
        })
        .then(() => {
            console.log(`Campo ${this.campoSeleccionado} actualizado a: ${this.nuevoValor}`);
            this.equipoSeleccionado = {}; // Resetea equipoSeleccionado
            this.nuevoValor = ''; // Resetea nuevoValor
        })
        .catch(error => {
            console.error("Error al actualizar el equipo: ", error);
        });
    } else if(this.campoSeleccionado=='logros') {
        // Usar el ID del logro seleccionado
        const logroId = this.logroSeleccionadoId; // Ahora esta variable contiene el ID del logro seleccionado
        const logrosRef = doc(this.firestore, `Equipos/${equipoId}/Logros/${logroId}`);

        // Verificar si el documento del logro existe
        getDoc(logrosRef).then(docSnapshot => {
            if (docSnapshot.exists()) {
                // Actualizar el campo específico dentro del documento del logro
                updateDoc(logrosRef, {
                    [this.campoSeleccionado2]: this.nuevoValor // Actualiza el campo del logro
                })
                .then(() => {
                    console.log(`Campo ${this.campoSeleccionado2} actualizado a: ${this.nuevoValor}`);
                    this.equipoSeleccionado = {}; // Resetea equipoSeleccionado
                    this.nuevoValor = ''; // Resetea nuevoValor
                })
                .catch(error => {
                    console.error("Error al actualizar el logro: ", error);
                });
            } else {
                console.error(`El documento del logro con ID ${logroId} no existe.`);
            }
        }).catch(error => {
            console.error("Error al verificar la existencia del logro: ", error);
        });
    }else{
      const partidoId = this.partidoSeleccionadoId; // Ahora esta variable contiene el ID del logro seleccionado
        const partidoRef = doc(this.firestore, `Equipos/${equipoId}/Partidos/${partidoId}`);

        // Verificar si el documento del logro existe
        getDoc(partidoRef).then(docSnapshot => {
            if (docSnapshot.exists()) {
                // Actualizar el campo específico dentro del documento del logro
                updateDoc(partidoRef, {
                    [this.campoSeleccionado2]: this.nuevoValor // Actualiza el campo del logro
                })
                .then(() => {
                    console.log(`Campo ${this.campoSeleccionado2} actualizado a: ${this.nuevoValor}`);
                    this.equipoSeleccionado = {}; // Resetea equipoSeleccionado
                    this.nuevoValor = ''; // Resetea nuevoValor
                })
                .catch(error => {
                    console.error("Error al actualizar el logro: ", error);
                });
            } else {
                console.error(`El documento del logro con ID ${partidoId} no existe.`);
            }
        }).catch(error => {
            console.error("Error al verificar la existencia del logro: ", error);
        });
    }
}






}
