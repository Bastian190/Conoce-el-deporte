import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../servicios/auth.service';
import { FirestoreService } from '../servicios/firestore.service';
import { Storage } from '@angular/fire/storage';
import { getDownloadURL, ref } from '@angular/fire/storage'; // Usar AngularFireStorage

@Component({
  selector: 'app-tab3',
  templateUrl: 'Misiones.page.html',
  styleUrls: ['Misiones.page.scss']
})
export class Misiones implements OnInit {
  rutinasSeleccionada: any = {};
  ejerciciosDelDia: any[] = [];
  private diaActual: string | null = null;

  constructor(
    public toastController: ToastController,
    private authService: AuthService, 
    private firestoreService: FirestoreService,
    private storage: Storage // Usamos Storage desde AngularFire
  ) {}

  getDayOfWeek(): string {
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const today = new Date().getDay();
    console.log(daysOfWeek[today]); // Esto devuelve un número del 0 al 6
    return daysOfWeek[today];
  }

  ngOnInit() {
    this.cargarEjerciciosDelDia();
  }

  async cargarEjerciciosDelDia() {
    const diaActual: string = this.getDayOfWeek(); // Obtener el día actual
    const currentUser = this.authService.getCurrentUser(); // Obtener el usuario autenticado
    const ejerciciosGuardados = JSON.parse(localStorage.getItem('ejerciciosDelDia') || 'null');
    const diaGuardado = localStorage.getItem('diaEjercicios');

    if (ejerciciosGuardados && diaGuardado === diaActual) {
        this.ejerciciosDelDia = ejerciciosGuardados;
        console.log('Ejercicios del día ya cargados desde localStorage:', this.ejerciciosDelDia);
        return;
    }

    if (currentUser) {
        const uid = currentUser.uid;
        try {
            const rutinaDelDia = await this.firestoreService.getRutinaDelDia(uid, diaActual);

            if (rutinaDelDia) {
                const nombreTipoRutina = rutinaDelDia[0];
                console.log(`Rutina del día (${diaActual}):`, nombreTipoRutina);

                // Obtener los ejercicios principales de la rutina
                const ejercicios = await this.firestoreService.getEjerciciosPorRutina(nombreTipoRutina);
                const ejerciciosAleatorios = this.shuffleArray(ejercicios);
                const ejerciciosSeleccionados = ejerciciosAleatorios.slice(0, 5); // Selecciona solo 5 ejercicios

                // Obtener 2 ejercicios de calentamiento
                const calentamientos = await this.firestoreService.getEjerciciosPorTipo('calentamiento');
                const calentamientosAleatorios = this.shuffleArray(calentamientos);
                const calentamientosSeleccionados = calentamientosAleatorios.slice(0, 2); // Selecciona solo 2 calentamientos

                // Obtener 2 ejercicios de estiramiento
                const estiramientos = await this.firestoreService.getEjerciciosPorTipo('estiramiento');
                const estiramientosAleatorios = this.shuffleArray(estiramientos);
                const estiramientosSeleccionados = estiramientosAleatorios.slice(0, 2); // Selecciona solo 2 estiramientos

                // Combinar todos los ejercicios: 5 ejercicios principales, 2 calentamientos, 2 estiramientos
                this.ejerciciosDelDia = [...calentamientosSeleccionados, ...ejerciciosSeleccionados, ...estiramientosSeleccionados];

                // Guardar los gifs en los ejercicios
                for (const ejercicio of this.ejerciciosDelDia) {
                    ejercicio.gifUrl = ejercicio.gift; // Asume que ejercicio.gift ya es una URL
                    console.log('URL del GIF:', ejercicio.gifUrl);
                }

                // Guardar en localStorage
                localStorage.setItem('ejerciciosDelDia', JSON.stringify(this.ejerciciosDelDia));
                localStorage.setItem('diaEjercicios', diaActual);

                console.log('Ejercicios del día:', this.ejerciciosDelDia);
            } else {
                this.mostrarToast('No hay rutina guardada para hoy.', 'warning');
            }
        } catch (error) {
            this.mostrarToast('Error al cargar los ejercicios del día.', 'danger');
            console.error('Error al cargar los ejercicios del día:', error);
        }
    } else {
        this.mostrarToast('Debes iniciar sesión para ver tu rutina.', 'warning');
    }
}


  

  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Intercambiar elementos
    }
    return array;
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
