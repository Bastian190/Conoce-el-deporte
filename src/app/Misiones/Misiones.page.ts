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
    const diaActual: string = this.getDayOfWeek();
    const currentUser = this.authService.getCurrentUser();
    const ejerciciosGuardados = JSON.parse(localStorage.getItem('ejerciciosDelDia') || 'null');
    const diaGuardado = localStorage.getItem('diaEjercicios');


    if (ejerciciosGuardados && diaGuardado === diaActual) {
        this.ejerciciosDelDia = ejerciciosGuardados;
        console.log('Ejercicios del día ya cargados desde localStorage:', this.ejerciciosDelDia);
        return;
    }

    if (currentUser) {
        try {
            // Obtener la intensidad desde Firestore
            const intensidadDoc = await this.firestoreService.getIntensidadRutina(currentUser.uid);
            console.log('Intensidad obtenida:', intensidadDoc);
  
            let puntosPorEjercicio = 0;
            if (intensidadDoc && intensidadDoc.intensidad) {
                switch (intensidadDoc.intensidad) {
                    case 'Facil':
                        puntosPorEjercicio = 5;
                        break;
                    case 'Media':
                        puntosPorEjercicio = 8;
                        break;
                    case 'Dificil':
                        puntosPorEjercicio = 10;
                        break;
                    default:
                        console.warn('Intensidad desconocida, usando puntaje por defecto de 0.');
                        puntosPorEjercicio = 0;
                }
            } else {
                console.warn('No se encontró intensidad o el valor es inválido.');
                puntosPorEjercicio = 0; // Asegurarse de que se utiliza 0 si no hay intensidad
            }
  
            const rutinaDelDia = await this.firestoreService.getRutinaDelDia(currentUser.uid, diaActual);
            console.log('Rutina del día obtenida:', rutinaDelDia);
  
            if (rutinaDelDia) {
                const nombreTipoRutina = rutinaDelDia[0];
                const ejercicios = await this.firestoreService.getEjerciciosPorRutina(nombreTipoRutina);
                console.log('Ejercicios principales:', ejercicios);
  
                const ejerciciosAleatorios = this.shuffleArray(ejercicios);
                const ejerciciosSeleccionados = ejerciciosAleatorios.slice(0, 5);
  
                const calentamientos = await this.firestoreService.getEjerciciosPorTipo('calentamiento');
                const calentamientosAleatorios = this.shuffleArray(calentamientos);
                const calentamientosSeleccionados = calentamientosAleatorios.slice(0, 2);
  
                const estiramientos = await this.firestoreService.getEjerciciosPorTipo('estiramiento');
                const estiramientosAleatorios = this.shuffleArray(estiramientos);
                const estiramientosSeleccionados = estiramientosAleatorios.slice(0, 2);
  
                this.ejerciciosDelDia = [...calentamientosSeleccionados, ...ejerciciosSeleccionados, ...estiramientosSeleccionados];
  
                // Confirmar que los ejercicios están siendo iterados correctamente
                this.ejerciciosDelDia.forEach(ejercicio => {
                    ejercicio.puntos = puntosPorEjercicio; // Asignar puntos según la intensidad
                    ejercicio.gifUrl = ejercicio.gift || ''; // Asumir que el campo gift contiene la URL o un string vacío
                    console.log(`Ejercicio: ${ejercicio.nombre}, Puntos: ${ejercicio.puntos}, GIF URL: ${ejercicio.gifUrl}`);
                });
  
                localStorage.setItem('ejerciciosDelDia', JSON.stringify(this.ejerciciosDelDia));
                localStorage.setItem('diaEjercicios', diaActual);
  
                console.log('Ejercicios del día guardados en localStorage:', this.ejerciciosDelDia);
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
