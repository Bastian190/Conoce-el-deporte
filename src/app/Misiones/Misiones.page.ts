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
        // Obtener la rutina semanal del usuario
        const rutinaDoc = await this.firestoreService.getRutinaDelDia(uid)
  
        if (rutinaDoc && rutinaDoc[diaActual]) {
          const tipoRutina = rutinaDoc[diaActual]; // Obtener el tipo de rutina para el día actual
  
          // Obtener ejercicios en la subcolección tipo_rutina
          const ejercicios = await this.firestoreService.getEjerciciosPorRutina(tipoRutina);
          this.ejerciciosDelDia = ejercicios; // Guardar los ejercicios del día
          console.log('Ejercicios del día:', this.ejerciciosDelDia);
        } else {
          console.log('No hay rutina guardada para hoy.');
        }
      } catch (error) {
        console.error('Error al cargar la rutina del día:', error);
      }
    } else {
      console.log('Debes iniciar sesión para ver tu rutina.');
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
