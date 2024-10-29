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
