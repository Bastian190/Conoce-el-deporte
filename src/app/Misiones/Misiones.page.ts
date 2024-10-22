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
  // Función para seleccionar N elementos aleatorios de un array
// Función para seleccionar N elementos aleatorios de un array


async cargarEjerciciosDelDia() {
  const diaActual: string = this.getDayOfWeek(); // Obtener el día actual
  const currentUser = this.authService.getCurrentUser(); // Obtener el usuario autenticado
  
  if (currentUser) {
    const uid = currentUser.uid; // Obtener el ID del usuario autenticado
    
    try {
      // Obtener la rutina del día actual del usuario
      const rutinaDelDia = await this.firestoreService.getRutinaDelDia(uid, diaActual);
      
      if (rutinaDelDia) {
        const nombreTipoRutina = rutinaDelDia[0]; // Asumiendo que rutinaDelDia es un array de strings
        console.log(`Rutina del día (${diaActual}):`, nombreTipoRutina);

        // Ahora buscar ejercicios que coincidan con el 'nombre_tipo_rutina'
        const ejercicios = await this.firestoreService.getEjerciciosPorRutina(nombreTipoRutina);
        
        if (ejercicios.length > 0) {
          this.ejerciciosDelDia = ejercicios; // Guardar los ejercicios en el array
          console.log('Ejercicios del día:', this.ejerciciosDelDia); // Verificar los ejercicios en consola
        } else {
          this.mostrarToast('No se encontraron ejercicios para la rutina de hoy.', 'warning');
        }
      } else {
        this.mostrarToast('No hay rutina guardada para hoy.', 'warning');
      }
    } catch (error) {
      this.mostrarToast('Error al cargar los ejercicios del día.', 'danger');
      console.error('Error al cargar los ejercicios del día:', error);
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
