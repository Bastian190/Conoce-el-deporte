import { Component, OnInit, NgZone,ChangeDetectorRef  } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../servicios/auth.service';
import { FirestoreService } from '../servicios/firestore.service';
import { Storage } from '@angular/fire/storage';
import { getDownloadURL, ref } from '@angular/fire/storage'; // Usar AngularFireStorage
import { addDoc, collection, doc, Firestore, getDoc, getDocs, increment, serverTimestamp, setDoc, updateDoc} from '@angular/fire/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { DateTime } from 'luxon';
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
    private ngZone: NgZone,
    private changeDetectorRef: ChangeDetectorRef // Usamos Storage desde AngularFire
  ) {}

  getDayOfWeek(): string {
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const today = new Date().getDay();
    console.log(daysOfWeek[today]); 
    return daysOfWeek[today];
  }

  ngOnInit() {
    this.cargarEjerciciosDelDia();
    this.cargarObjetivos();
    this.verificarAutenticacion();
    
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

 

  verificarAutenticacion() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // Usuario autenticado, carga los objetivos
        this.cargarObjetivos();
      } else {
        // Usuario no autenticado, redirige a inicio de sesión
        this.authService.signOut(); // Cierra la sesión si es necesario
        // Aquí puedes redirigir al usuario a la página de login
      }
    });
  }

  cargarObjetivos() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const rutinaId = 'PlyuiOZ5ex4zKxUcZGTO'; // Reemplaza esto con el ID correcto de la rutina
      const currentUserId = currentUser.uid;
      
      // Obtener la fecha actual en formato YYYY-MM-DD usando Luxon
      const hoy = DateTime.now().toISODate(); // Obtiene la fecha actual en formato ISO (YYYY-MM-DD)
  
      // Obtener objetivos generales de la rutina
      getDocs(collection(this.firestore, `Rutinas/${rutinaId}/objetivos`))
        .then(async objetivosSnapshot => {
          const objetivos = objetivosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
  
          // Obtener objetivos completados hoy
          const objetivosCompletadosRef = doc(this.firestore, `usuarios/${currentUserId}/objetivosCompletados/${hoy}`);
          const objetivosCompletadosDoc = await getDoc(objetivosCompletadosRef);
          const objetivosCompletadosHoy = objetivosCompletadosDoc.exists() ? objetivosCompletadosDoc.data() : {};
  
          // Filtrar los objetivos no completados hoy
          this.objetivos = objetivos.filter(objetivo => !objetivosCompletadosHoy[objetivo.id]).slice(0, 5); // Limitar a los primeros 5 objetivos
  
          console.log('Objetivos cargados para hoy:', this.objetivos);
        })
        .catch(error => {
          this.mostrarToast('Error al cargar los objetivos.', 'danger');
          console.error('Error al cargar los objetivos:', error);
        });
    } else {
      this.mostrarToast('Debes iniciar sesión para ver tus objetivos.', 'warning');
    }
  }


  marcarObjetivoComoFinalizado(objetivoId: string): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.mostrarToast('Debes iniciar sesión para finalizar un objetivo.', 'warning');
      return Promise.resolve(); // Retorna un Promise<void> si no hay un usuario actual
    }
  
    const rutinaId = 'PlyuiOZ5ex4zKxUcZGTO'; // ID de la rutina
    const currentUserId = currentUser.uid;
    const hoy = DateTime.now().toISODate(); // Fecha actual en formato YYYY-MM-DD
  
    // Obtener la referencia del objetivo
    const objetivoDocRef = doc(this.firestore, `Rutinas/${rutinaId}/objetivos`, objetivoId);
  
    return getDoc(objetivoDocRef).then((objetivoDoc) => {
      if (objetivoDoc.exists()) {
        const objetivoData = objetivoDoc.data();
        const puntos = objetivoData['puntaje'] || 0;
  
        // Registrar el objetivo completado en Firestore
        const objetivosCompletadosRef = doc(this.firestore, `usuarios/${currentUserId}/objetivosCompletados/${hoy}`);
        return setDoc(objetivosCompletadosRef, { [objetivoId]: true }, { merge: true })
          .then(() => {
            // Obtener el documento de puntajes del usuario
            const puntajesRef = collection(this.firestore, `usuarios/${currentUserId}/puntajes`);
            return getDocs(puntajesRef).then((puntajesSnapshot) => {
              if (!puntajesSnapshot.empty) {
                const puntajeDoc = puntajesSnapshot.docs[0];
                const puntajeRef = doc(this.firestore, `usuarios/${currentUserId}/puntajes`, puntajeDoc.id);
  
                // Actualizar el documento encontrado
                return updateDoc(puntajeRef, {
                  puntos: increment(puntos),
                  fecha: serverTimestamp(),
                }).then(() => {
                  console.log(`Puntaje de ${puntos} sumado al documento existente del usuario.`);
                  return;
                });
              } else {
                // Si no hay documentos en puntajes, crear uno nuevo
                return addDoc(collection(this.firestore, `usuarios/${currentUserId}/puntajes`), {
                  puntos: puntos,
                  fecha: serverTimestamp(),
                }).then(() => {
                  console.log(`Se creó un nuevo documento de puntaje con ${puntos}.`);
                  return;
                });
              }
            });
          })
          .then(() => {
            // Llama a la función para reemplazar el objetivo completado en la lista
            this.reemplazarObjetivo(objetivoId, rutinaId);
            // Mostrar el mensaje de éxito
            this.mostrarToast('¡Objetivo completado!', 'success');
          });
      } else {
        console.log('Objetivo no encontrado.');
        return Promise.resolve(); // Retorna un Promise<void> si el objetivo no existe
      }
    })
    .catch((error) => {
      console.error('Error al marcar el objetivo como finalizado:', error);
      this.mostrarToast('Error al completar el objetivo.', 'danger');
    });
  }
  

  reemplazarObjetivo(objetivoId: string, rutinaId: string) {
    getDocs(collection(this.firestore, `Rutinas/${rutinaId}/objetivos`))
      .then((objetivosSnapshot) => {
        const objetivosDisponibles = objetivosSnapshot.docs
          .filter((doc) => doc.id !== objetivoId)
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
        if (objetivosDisponibles.length > 0) {
          const nuevoObjetivo = objetivosDisponibles[Math.floor(Math.random() * objetivosDisponibles.length)];
  
          // Actualiza la lista de objetivos
          this.objetivos = [...this.objetivos.filter(obj => obj.id !== objetivoId), nuevoObjetivo].slice(0, 5);
  
          console.log('Nuevo objetivo agregado:', nuevoObjetivo);
        } else {
          console.log('No hay más objetivos disponibles para agregar.');
        }
      })
      .catch((error) => {
        console.error('Error al reemplazar objetivo:', error);
      });
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
