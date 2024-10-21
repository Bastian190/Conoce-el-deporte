import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../servicios/auth.service';
import { FirestoreService } from '../servicios/firestore.service';


@Component({
  selector: 'app-tab3',
  templateUrl: 'Misiones.page.html',
  styleUrls: ['Misiones.page.scss']
})
export class Misiones {
  rutinasSeleccionada: any = {};
  ejerciciosDelDia: any[] = [];
  
  constructor(public toastController: ToastController,private authService: AuthService, private firestoreService:FirestoreService,) { }
  getDayOfWeek():string {
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const today = new Date().getDay();
    console.log(daysOfWeek[today]) // Esto devuelve un número del 0 al 6, donde 0 es Domingo y 6 es Sábado
    return daysOfWeek[today]; 
    // Devuelve el nombre del día de la semana
  }
  ngOnInit() {
    this.cargarEjerciciosDelDia();
  }
  
  async cargarEjerciciosDelDia() {
    const diaActual: string = this.getDayOfWeek(); // Obtener el día actual
    const currentUser = this.authService.getCurrentUser(); // Obtener el usuario autenticado
  
    if (currentUser) {
      const uid = currentUser.uid; // Obtener el ID del usuario autenticado
  
      try {
        // Obtener la rutina del día actual del usuario
        const rutinaDelDia = await this.firestoreService.getRutinaDelDia(uid, diaActual);
  
        if (rutinaDelDia && Array.isArray(rutinaDelDia)) {
          const ejerciciosPromises = rutinaDelDia.map(async (rutina: string) => {
            // Buscar ejercicios en la subcolección tipo_rutina
            return this.firestoreService.getEjerciciosPorRutina(rutina);
          });
  
          // Esperar todas las promesas y aplanar el resultado
          const ejerciciosArray = await Promise.all(ejerciciosPromises);
          this.ejerciciosDelDia = ejerciciosArray.reduce((acc, val) => acc.concat(val), []); // Aplanar el array
  
          console.log('Ejercicios del día:', this.ejerciciosDelDia); // Imprimir para verificar
        } else {
          this.mostrarToast('No hay rutina guardada para hoy.', 'warning');
        }
      } catch (error) {
        this.mostrarToast('Error al cargar la rutina del día.', 'danger');
        console.error('Error al cargar la rutina del día: ', error);
      }
    } else {
      this.mostrarToast('Debes iniciar sesión para ver tu rutina.', 'warning');
      // Redirigir a la página de inicio de sesión si no hay usuario
    }
  }
  
  
  
  
  
  async mostrarToast(message: string, color: string = 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }
}
