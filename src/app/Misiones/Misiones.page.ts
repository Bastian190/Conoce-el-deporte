import { Component, OnInit, NgZone } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../servicios/auth.service';
import { FirestoreService } from '../servicios/firestore.service';
import { Storage } from '@angular/fire/storage';
import { getDownloadURL, ref } from '@angular/fire/storage'; // Usar AngularFireStorage
import { addDoc, collection, doc, Firestore, getDoc, getDocs, increment, serverTimestamp, setDoc, updateDoc} from '@angular/fire/firestore';
@Component({
  selector: 'app-tab3',
  templateUrl: 'Misiones.page.html',
  styleUrls: ['Misiones.page.scss']
})
export class Misiones implements OnInit {
  rutinasSeleccionada: any = {};
  ejerciciosDelDia: any[] = [];
  objetivos: any[] = []; 
  private diaActual: string | null = null;
  
  constructor(
    public toastController: ToastController,
    private authService: AuthService, 
    private firestoreService: FirestoreService,
    private storage: Storage,
    private firestore: Firestore,
    private ngZone: NgZone // Usamos Storage desde AngularFire
  ) {}

  getDayOfWeek(): string {
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const today = new Date().getDay();
    console.log(daysOfWeek[today]); // Esto devuelve un número del 0 al 6
    return daysOfWeek[today];
  }

  ngOnInit() {
    this.cargarEjerciciosDelDia();
    this.cargarObjetivos();
    
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

async cargarObjetivos() {
  const currentUser = this.authService.getCurrentUser();
  if (currentUser) {
    try {
      const rutinaId = 'PlyuiOZ5ex4zKxUcZGTO'; // Reemplaza esto con el ID correcto de la rutina
      const objetivosSnapshot = await getDocs(collection(this.firestore, `Rutinas/${rutinaId}/objetivos`));
      
      this.objetivos = objetivosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).slice(0, 5); // Limitar a los primeros 5 objetivos

      console.log('Objetivos cargados:', this.objetivos);

    } catch (error) {
      this.mostrarToast('Error al cargar los objetivos.', 'danger');
      console.error('Error al cargar los objetivos:', error);
    }
  } else {
    this.mostrarToast('Debes iniciar sesión para ver tus objetivos.', 'warning');
  }
}


 async marcarObjetivoComoFinalizado(objetivoId: string) {
  const currentUser = this.authService.getCurrentUser();
  if (currentUser) {
    const rutinaId = 'PlyuiOZ5ex4zKxUcZGTO'; // Reemplaza con el ID correcto

    try {
      // Obtener el objetivo específico
      const objetivoDoc = await getDoc(doc(this.firestore, `Rutinas/${rutinaId}/objetivos`, objetivoId));
      if (objetivoDoc.exists()) {
        const objetivoData = objetivoDoc.data();
        const puntos = objetivoData['puntaje'] || 0; // Usar el puntaje del objetivo específico

        // Obtener el primer documento de la subcolección de puntajes del usuario
        const puntajesSnapshot = await getDocs(collection(this.firestore, `usuarios/${currentUser.uid}/puntajes`));
        if (!puntajesSnapshot.empty) {
          const puntajeDoc = puntajesSnapshot.docs[0]; // Tomar el primer documento encontrado
          const puntajeRef = doc(this.firestore, `usuarios/${currentUser.uid}/puntajes`, puntajeDoc.id); // Referencia al documento

          // Actualizar el campo 'puntaje' con el valor específico del objetivo
          await updateDoc(puntajeRef, {
            puntos: increment(puntos), // Incrementa el puntaje con el valor específico del objetivo
            fecha: serverTimestamp() // Actualiza la fecha a la actual
          });
          console.log(`Puntaje de ${puntos} sumado al documento existente del usuario.`);
        } else {
          // Si no hay documentos en puntajes, crear uno nuevo con el puntaje específico
          await addDoc(collection(this.firestore, `usuarios/${currentUser.uid}/puntajes`), {
            puntos: puntos,
            fecha: serverTimestamp()
          });
          console.log(`Se creó un nuevo documento de puntaje con ${puntos}.`);
        }

        // Cargar un nuevo objetivo para reemplazar el completado
        await this.reemplazarObjetivo(objetivoId, rutinaId);
      } else {
        console.log('Objetivo no encontrado.');
      }
    } catch (error) {
      this.mostrarToast('Error al marcar el objetivo como finalizado.', 'danger');
      console.error('Error al marcar objetivo:', error);
    }
  } else {
    this.mostrarToast('Debes iniciar sesión para finalizar un objetivo.', 'warning');
  }
}





  async reemplazarObjetivo(objetivoId: string, rutinaId: string) {
    // Obtener un nuevo objetivo aleatorio de la colección de objetivos
    const objetivosSnapshot = await getDocs(collection(this.firestore, `Rutinas/${rutinaId}/objetivos`));
    
    // Filtrar los objetivos que no han sido completados
    const objetivosDisponibles = objetivosSnapshot.docs.filter(doc => doc.id !== objetivoId).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (objetivosDisponibles.length > 0) {
      // Elegir un nuevo objetivo aleatorio
      const nuevoObjetivo = objetivosDisponibles[Math.floor(Math.random() * objetivosDisponibles.length)];
      
      // Agregar el nuevo objetivo al array
      this.objetivos.push(nuevoObjetivo);
      this.objetivos = this.objetivos.slice(0, 5); // Asegúrate de mantener solo 5 objetivos

      console.log('Nuevo objetivo agregado:', nuevoObjetivo);
    } else {
      console.log('No hay más objetivos disponibles para agregar.');
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
