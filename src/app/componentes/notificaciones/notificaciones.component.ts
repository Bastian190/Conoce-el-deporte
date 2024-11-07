import { Component } from '@angular/core';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/servicios/auth.service';
import { ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import { NotificationService } from 'src/app/servicios/notificaciones-service.service';


@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss'],
})
export class NotificacionesComponent {
  equipos: any[] = [];
  equipoSeleccionado: string = '';
  tipoNotificacion: string = '';
  mensajeNotificacion: string = '';
  equipoNombreSeleccionado: string = '';

  constructor(private firestore: Firestore, private router: Router, private authService: AuthService,
    private toastController: ToastController, private http: HttpClient, private platform: Platform, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.obtenerEquiposAdministrados();
  }

  

  async obtenerEquiposAdministrados() {
    const currentUser = this.authService.getCurrentUser();
  
    if (!currentUser) {
      console.log('Debes iniciar sesión para ver tu rutina.', 'warning');
      return; // Salir si no hay usuario
    }
  
    const adminCollection = collection(this.firestore, `usuarios/${currentUser.uid}/administracion`);
  
    collectionData(adminCollection, { idField: 'id' }).subscribe({
      next: async (administracion) => {
        this.equipos = [];
  
        for (const docAdmin of administracion) {
          const equipoRef = docAdmin['id_equipo'];
  
          if (equipoRef && equipoRef.id) {
            const equipoId = equipoRef.id;
            console.log(`Buscando equipo con ID: ${equipoId}`);
  
            const equipoDocRef = doc(this.firestore, `Equipos/${equipoId}`);
            const equipoDoc = await getDoc(equipoDocRef);
  
            if (equipoDoc.exists()) {
              const equipoData = equipoDoc.data();
              if (equipoData) {
                this.equipos.push({ id: equipoDoc.id, ...equipoData });
                console.log(`Equipo encontrado: ${equipoData['nombre']}`);
              } else {
                console.error("Los datos del equipo son nulos o indefinidos.");
              }
            } else {
              console.error(`El documento del equipo con ID ${equipoId} no existe.`);
            }
          } else {
            console.error("El ID del equipo es inválido.");
          }
        }
  
        console.log('Equipos administrados: ', this.equipos);
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

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom',
    });
    toast.present();
  }

  onEquipoChange(equipoId: string) {
    const equipo = this.equipos.find(e => e.id === equipoId);
    if (equipo) {
      this.equipoNombreSeleccionado = equipo.nombre_fantasia;
    }
  }

  async enviarNotificacion() {
    if (!this.equipoSeleccionado || !this.tipoNotificacion || !this.mensajeNotificacion) {
      this.mostrarToast('Por favor completa todos los campos.', 'warning');
      return;
    }

    const notificacionData = {
      notificacion: this.mensajeNotificacion,
      equipo_notificacion: this.equipoNombreSeleccionado,
      tipo: this.tipoNotificacion,
      fecha: new Date(),
    };

    const notificacionesCollection = collection(this.firestore, 'notificaciones');

    try {
      await addDoc(notificacionesCollection, notificacionData);
      this.mostrarToast('Notificación guardada en Firestore.', 'success');

      await this.enviarNotificacionPush({
        mensaje: this.mensajeNotificacion,
        equipoId: this.equipoSeleccionado,
        tipo: this.tipoNotificacion
      });

      this.equipoSeleccionado = '';
      this.tipoNotificacion = '';
      this.mensajeNotificacion = '';
      this.equipoNombreSeleccionado = '';
    } catch (error) {
      console.error('Error al enviar la notificación: ', error);
      this.mostrarToast('Ocurrió un error al enviar la notificación.', 'danger');
    }
  }

  async enviarNotificacionPush(notificacion: any) {
    const usuariosRef = collection(this.firestore, 'usuarios');
    const usuariosSnapshot = await getDocs(usuariosRef);

    console.log(`Total usuarios encontrados: ${usuariosSnapshot.docs.length}`);

    let usuariosParaNotificar = [];

    for (const usuarioDoc of usuariosSnapshot.docs) {
      const usuarioData = usuarioDoc.data();
      const usuarioId = usuarioDoc.id;
      const equiposSeguidosRef = collection(this.firestore, `usuarios/${usuarioId}/equiposSeguidos`);
      const equiposSeguidosSnapshot = await getDocs(equiposSeguidosRef);

      for (const equipoDoc of equiposSeguidosSnapshot.docs) {
        const equipoData = equipoDoc.data();
        const equipoId = equipoData['equipoId'];

        if (equipoId === notificacion.equipoId) {
          const tipoNotificacion = equipoData['tipoNotificacion'];

          if (
            tipoNotificacion === 'todos' ||
            tipoNotificacion === notificacion.tipo
          ) {
            const fcmToken = usuarioData['fcmToken'];
            if (fcmToken) {
              usuariosParaNotificar.push(fcmToken);
              console.log(`Usuario con FCM token encontrado: ${fcmToken}`);
            }
          }
        }
      }
    }

    if (usuariosParaNotificar.length === 0) {
      console.log('No hay usuarios para enviar la notificación');
    } else {
      console.log(`Enviando notificación a ${usuariosParaNotificar.length} usuarios.`);
      try {
        console.log('Notificación enviada exitosamente.');
      } catch (error) {
        console.error('Error al enviar la notificación FCM:', error);
      }
    }
  }
}
