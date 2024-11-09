import { Component } from '@angular/core';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { PushNotifications } from '@capacitor/push-notifications';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/servicios/auth.service';
import { ToastController } from '@ionic/angular';
import { NotificacionService } from 'src/app/servicios/notificaciones-service.service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss'],
})
export class NotificacionesComponent {
  equipos: any[] = []; // Lista de equipos que administra el administrador
  equipoSeleccionado: string = '';
  tipoNotificacion: string = '';
  mensajeNotificacion: string = '';
  equipoNombreSeleccionado: string = '';

  constructor(private firestore: Firestore, private router: Router, private authService: AuthService,private toastController: ToastController,private notificacionService: NotificacionService, private http: HttpClient ) {}
    
  ngOnInit(){
    this.obtenerEquiposAdministrados(); // Cargar equipos de los administradores
  }

  async obtenerEquiposAdministrados() {
    const currentUser = this.authService.getCurrentUser();
  
    if (!currentUser) {
      console.log('Debes iniciar sesión para ver tu rutina.', 'warning');
      return; // Salir si no hay usuario
    }
  
    const adminCollection = collection(this.firestore, `usuarios/${currentUser.uid}/administracion`);
  
    // Suscribirse a los datos de la colección de administración
    collectionData(adminCollection, { idField: 'id' }).subscribe({
      next: async (administracion) => {
        this.equipos = []; // Limpiar la lista de equipos antes de cargar nuevos datos
  
        // Recorremos cada documento de administración
        for (const docAdmin of administracion) {
          const equipoRef = docAdmin['id_equipo']; // Asegúrate de que este campo es correcto
  
          if (equipoRef && equipoRef.id) {
            const equipoId = equipoRef.id; // Obtén el ID de la referencia
            console.log(`Buscando equipo con ID: ${equipoId}`); // Log para depuración
  
            const equipoDocRef = doc(this.firestore, `Equipos/${equipoId}`);
            const equipoDoc = await getDoc(equipoDocRef);
  
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
        console.log('Ocurrió un error al obtener los equipos.', 'danger');
      }
    });
  }


  irAPaginaDestino() {
    this.router.navigate(['/tabs/perfil']);
  }
  // Aquí puedes agregar la función mostrarToast
  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000, // Duración en milisegundos
      color: color, // Color del toast (puede ser 'primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'dark')
      position: 'bottom', // Posición del toast
    });
    toast.present(); // Mostrar el toast
  }

   // Método que se llama cuando el equipo seleccionado cambia
   onEquipoChange(equipoId: string) {
    const equipo = this.equipos.find(e => e.id === equipoId);
    if (equipo) {
      this.equipoNombreSeleccionado = equipo.nombre_fantasia; // Almacena el nombre del equipo seleccionado
    }
  }

  async enviarNotificacion() {
    if (!this.equipoSeleccionado || !this.tipoNotificacion || !this.mensajeNotificacion) {
      this.mostrarToast('Por favor completa todos los campos.', 'warning');
      return;
    }
  
    const notificacionData = {
      notificacion: this.mensajeNotificacion,
      equipo_notificacion: this.equipoNombreSeleccionado, // Usa el nombre del equipo (nombre_fantasia)
      tipo: this.tipoNotificacion,
      fecha: new Date(), // Almacena la fecha de envío
      equipoId: this.equipoSeleccionado, // ID del equipo para realizar el filtro
    };
  
    const notificacionesCollection = collection(this.firestore, 'notificaciones');
  
    try {
      // Guardamos la notificación en la colección 'notificaciones'
      const docRef = await addDoc(notificacionesCollection, notificacionData);
      await this.notificacionService.enviarNotificacionesMasivas(this.equipoNombreSeleccionado, this.mensajeNotificacion)
      this.mostrarToast('Notificación enviada exitosamente.', 'success');
      
      // Limpiar los campos después de enviar
      this.equipoSeleccionado = '';
      this.tipoNotificacion = '';
      this.mensajeNotificacion = '';
      this.equipoNombreSeleccionado = ''; // Limpiar el nombre del equipo
  
      // Ahora enviamos las notificaciones push a los usuarios suscritos a este equipo
      
    } catch (error) {
      console.error('Error al enviar la notificación: ', error);
      this.mostrarToast('Ocurrió un error al enviar la notificación.', 'danger');
    }
  }
  
  
  
}

  


