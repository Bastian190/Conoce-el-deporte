import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../servicios/auth.service';
import { FirestoreService } from '../servicios/firestore.service';
import { Storage } from '@angular/fire/storage';
import { getDownloadURL, ref } from '@angular/fire/storage'; // Usar AngularFireStorage
import { addDoc, collection, doc, Firestore, getDoc, getDocs, serverTimestamp, updateDoc} from '@angular/fire/firestore';
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
    private storage: Storage,
    private firestore: Firestore // Usamos Storage desde AngularFire
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

                const ejercicios = await this.firestoreService.getEjerciciosPorRutina(nombreTipoRutina);

                if (ejercicios.length > 0) {
                    const ejerciciosAleatorios = this.shuffleArray(ejercicios);
                    this.ejerciciosDelDia = ejerciciosAleatorios.slice(0, 5);

                    for (const ejercicio of this.ejerciciosDelDia) {
                        // Asume que ejercicio.gift ya es una URL
                        ejercicio.gifUrl = ejercicio.gift; // No se necesita más procesamiento
                        console.log('URL del GIF:', ejercicio.gifUrl);
                    }

                    localStorage.setItem('ejerciciosDelDia', JSON.stringify(this.ejerciciosDelDia));
                    localStorage.setItem('diaEjercicios', diaActual);

                    console.log('Ejercicios del día:', this.ejerciciosDelDia);
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
    }
}

  

  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Intercambiar elementos
    }
    return array;
  }

  private async getGifUrl(gifReference: any): Promise<string> {
    if (gifReference && typeof gifReference === 'object') {
        // Intenta acceder a la propiedad que esperas
        gifReference = gifReference.url || ''; // Ajusta según la estructura real
    }

    // Aquí sigue la lógica existente para manejar las cadenas
    if (typeof gifReference !== 'string') {
        throw new Error('gifReference debe ser una cadena, pero recibió: ' + typeof gifReference);
    }

    // Comprobar si ya es una URL pública
    if (gifReference.startsWith('https://firebasestorage.googleapis.com/')) {
        return gifReference; // Retorna la URL directamente
    }

    // Convertir gs:// a URL HTTP
    if (gifReference.startsWith('gs://')) {
        const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/conoce-eldeporte.appspot.com/o/';
        const path = encodeURIComponent(gifReference.replace('gs://conoce-eldeporte.appspot.com/', ''));
        return `${baseUrl}${path}?alt=media`; // Retorna la URL de descarga
    }

    throw new Error('URL de GIF no válida: ' + gifReference);
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
