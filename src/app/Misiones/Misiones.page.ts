import { Component, OnInit, NgZone,ChangeDetectorRef  } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../servicios/auth.service';
import { FirestoreService } from '../servicios/firestore.service';
import { Storage } from '@angular/fire/storage';
import { getDownloadURL, ref } from '@angular/fire/storage'; // Usar AngularFireStorage
import { addDoc, collection, doc, Firestore, getDoc, getDocs, increment, serverTimestamp, setDoc, updateDoc} from '@angular/fire/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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

    if (!currentUser) {
        this.mostrarToast('Debes iniciar sesión para ver tu rutina.', 'warning');
        return; // Salir si no hay usuario
    }

    const ejerciciosGuardados = JSON.parse(localStorage.getItem(`ejerciciosDelDia_${currentUser.uid}`) || 'null');
    const diaGuardado = localStorage.getItem(`diaEjercicios_${currentUser.uid}`);

    // Cargar ejercicios completados desde localStorage
    const ejerciciosCompletadosGuardados: { ejercicioId: string; nombre: string; fecha: Date; puntos: number }[] = 
        JSON.parse(localStorage.getItem(`ejerciciosCompletados_${currentUser.uid}`) || '[]');

    if (ejerciciosGuardados && diaGuardado === diaActual) {
        this.ejerciciosDelDia = ejerciciosGuardados;

        // Marca los ejercicios como completados según el localStorage
        this.ejerciciosDelDia.forEach(ejercicio => {
            const completado = ejerciciosCompletadosGuardados.some((completado: { ejercicioId: string }) => completado.ejercicioId === ejercicio.id);
            ejercicio.completado = completado;
        });

        return;
    }

    try {
        const intensidadDoc = await this.firestoreService.getIntensidadRutina(currentUser.uid);
        let puntosPorEjercicio = 0;
        let repeticiones = 10; // Repeticiones por defecto para "Fácil"

        // Asigna los puntos y repeticiones según la intensidad
        if (intensidadDoc && intensidadDoc.intensidad) {
            switch (intensidadDoc.intensidad) {
                case 'Facil':
                    puntosPorEjercicio = 5;
                    repeticiones = 10;
                    break;
                case 'Media':
                    puntosPorEjercicio = 8;
                    repeticiones = 14;
                    break;
                case 'Dificil':
                    puntosPorEjercicio = 10;
                    repeticiones = 18;
                    break;
            }
        }

        const duracionPorIntensidad = { Facil: 30, Media: 45, Dificil: 60 };
        const rutinaDelDia = await this.firestoreService.getRutinaDelDia(currentUser.uid, diaActual);

        if (rutinaDelDia) {
            const nombreTipoRutina = rutinaDelDia[0];
            const ejercicios = await this.firestoreService.getEjerciciosPorRutina(nombreTipoRutina);

            const ejerciciosAleatorios = this.shuffleArray(ejercicios).slice(0, 5);
            const calentamientos = this.shuffleArray(await this.firestoreService.getEjerciciosPorTipo('calentamiento')).slice(0, 2);
            const estiramientos = this.shuffleArray(await this.firestoreService.getEjerciciosPorTipo('estiramiento')).slice(0, 2);

            this.ejerciciosDelDia = [...calentamientos, ...ejerciciosAleatorios, ...estiramientos];

            // Cargar ejercicios completados de Firestore
            const ejerciciosCompletados = await this.cargarEjerciciosCompletados(currentUser.uid);

            // Guardar los ejercicios completados en localStorage
            const ejerciciosCompletadosParaGuardar: { ejercicioId: string; nombre: string; fecha: Date; puntos: number }[] = [];

            this.ejerciciosDelDia.forEach(ejercicio => {
                // Verifica si el ejercicio ha sido completado
                const completado = ejerciciosCompletados.some((completado: { id: string }) => completado.id === ejercicio.id) || 
                                   ejerciciosCompletadosGuardados.some((completado: { ejercicioId: string }) => completado.ejercicioId === ejercicio.id);
                ejercicio.completado = completado;

                // Agregar a la lista de completados si es necesario
                if (completado) {
                    ejerciciosCompletadosParaGuardar.push({
                        ejercicioId: ejercicio.id,
                        nombre: ejercicio.nombre_ejercicio,
                        fecha: new Date(),
                        puntos: ejercicio.puntos
                    });
                }

                if (ejercicio.nombre_tipo_rutina === 'calentamiento' || ejercicio.nombre_tipo_rutina === 'estiramiento') {
                    ejercicio.duracion = 30;
                    ejercicio.series = 1;
                    ejercicio.repeticiones = 0;  // Sin repeticiones para estos tipos
                } else if (ejercicio.nombre_ejercicio === 'Plancha' || ejercicio.nombre_ejercicio === 'Puñetazos') {
                    // Asigna duración específica según la intensidad para estos ejercicios
                    const intensidad = intensidadDoc.intensidad as 'Facil' | 'Media' | 'Dificil';
                    ejercicio.duracion = duracionPorIntensidad[intensidad] || 30;
                    ejercicio.series = 1;
                    ejercicio.repeticiones = 0;
                } else {
                    ejercicio.series = 2;
                    ejercicio.repeticiones = repeticiones;
                }
                // Verifica la propiedad 'gifUrl' de cada ejercicio
                ejercicio.gifUrl = ejercicio.gifUrl || ejercicio.gift || '';  // Asegura la URL del GIF
                ejercicio.puntos = puntosPorEjercicio;
            });

            // Guardar en localStorage
            localStorage.setItem(`ejerciciosDelDia_${currentUser.uid}`, JSON.stringify(this.ejerciciosDelDia));
            localStorage.setItem(`diaEjercicios_${currentUser.uid}`, diaActual);
            localStorage.setItem(`ejerciciosCompletados_${currentUser.uid}`, JSON.stringify(ejerciciosCompletadosParaGuardar));
        } else {
            this.mostrarToast('No hay rutina guardada para hoy.', 'warning');
        }
    } catch (error) {
        this.mostrarToast('Error al cargar los ejercicios del día.', 'danger');
        console.error('Error al cargar los ejercicios del día:', error);
    }
}



private async cargarEjerciciosCompletados(userId: string) {
  const ejerciciosCompletadosRef = collection(this.firestore, `usuarios/${userId}/ejerciciosCompletados`);
  const ejerciciosCompletadosSnapshot = await getDocs(ejerciciosCompletadosRef);
  const ejerciciosCompletados = ejerciciosCompletadosSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

  // Guardar en localStorage para mantener el estado entre sesiones
  localStorage.setItem(`ejerciciosCompletados_${userId}`, JSON.stringify(ejerciciosCompletados));
  return ejerciciosCompletados;
}
  

private async guardarEjercicioCompletado(ejercicio: any, userId: string) {
  try {
      const ejerciciosCompletadosRef = collection(this.firestore, `usuarios/${userId}/ejerciciosCompletados`);
      
      // Agregar el ejercicio completado a la subcolección
      await addDoc(ejerciciosCompletadosRef, {
          ejercicioId: ejercicio.id,
          nombre: ejercicio.nombre_ejercicio,
          fecha: new Date(),
          puntos: ejercicio.puntos
      });

      // Actualizar el almacenamiento local
      const ejerciciosCompletadosGuardados = JSON.parse(localStorage.getItem(`ejerciciosCompletados_${userId}`) || '[]');
      ejerciciosCompletadosGuardados.push({
          ejercicioId: ejercicio.id,
          nombre: ejercicio.nombre_ejercicio,
          fecha: new Date(),
          puntos: ejercicio.puntos
      });
      localStorage.setItem(`ejerciciosCompletados_${userId}`, JSON.stringify(ejerciciosCompletadosGuardados));

      this.mostrarToast(`Ejercicio ${ejercicio.nombre_ejercicio} completado!`, 'success');
  } catch (error) {
      // Manejo de errores...
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
      getDocs(collection(this.firestore, `Rutinas/${rutinaId}/objetivos`))
        .then(objetivosSnapshot => {
          this.objetivos = objetivosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).slice(0, 5); // Limitar a los primeros 5 objetivos

          console.log('Objetivos cargados:', this.objetivos);
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
    if (currentUser) {
      const rutinaId = 'PlyuiOZ5ex4zKxUcZGTO'; // ID de la rutina
      const objetivoDocRef = doc(this.firestore, `Rutinas/${rutinaId}/objetivos`, objetivoId);
  
      return getDoc(objetivoDocRef).then((objetivoDoc) => {
        if (objetivoDoc.exists()) {
          const objetivoData = objetivoDoc.data();
          const puntos = objetivoData['puntaje'] || 0;
  
          const puntajesRef = collection(this.firestore, `usuarios/${currentUser.uid}/puntajes`);
          return getDocs(puntajesRef).then((puntajesSnapshot) => {
            if (!puntajesSnapshot.empty) {
              const puntajeDoc = puntajesSnapshot.docs[0];
              const puntajeRef = doc(this.firestore, `usuarios/${currentUser.uid}/puntajes`, puntajeDoc.id);
  
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
              return addDoc(collection(this.firestore, `usuarios/${currentUser.uid}/puntajes`), {
                puntos: puntos,
                fecha: serverTimestamp(),
              }).then(() => {
                console.log(`Se creó un nuevo documento de puntaje con ${puntos}.`);
                return;
              });
            }
          });
        } else {
          console.log('Objetivo no encontrado.');
          return Promise.resolve(); // Retorna un Promise<void> si el objetivo no existe
        }
      })
      .then(() => {
        // Llamar a reemplazarObjetivo después de marcar el objetivo como finalizado
        return this.reemplazarObjetivo(objetivoId, rutinaId);
      })
      .catch((error) => {
        this.mostrarToast('Error al marcar el objetivo como finalizado.', 'danger');
        console.error('Error al marcar objetivo:', error);
      });
    } else {
      this.mostrarToast('Debes iniciar sesión para finalizar un objetivo.', 'warning');
      return Promise.resolve(); // Retorna un Promise<void> si no hay un usuario actual
    }
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
  async completarEjercicio(ejercicio: any) {
    const currentUser = this.authService.getCurrentUser();
  
    if (currentUser) {
      // Asignar puntaje correspondiente al ejercicio
      const puntosAsignados = ejercicio.puntos; // Asumiendo que el ejercicio tiene una propiedad 'puntos'
  
      // Guardar en Firestore en la subcolección 'puntajes' del usuario
      const userRef = doc(this.firestore, `usuarios/${currentUser.uid}`); // Referencia al documento del usuario
      const puntajesRef = collection(userRef, 'puntajes'); // Referencia a la subcolección 'puntajes'
  
      // Obtener el documento de puntajes
      const puntajesSnapshot = await getDocs(puntajesRef);
  
      if (!puntajesSnapshot.empty) {
        // Si ya hay documentos en la subcolección, tomamos el primero
        const puntajesDoc = puntajesSnapshot.docs[0];
        const puntajesDocId = puntajesDoc.id;
  
        // Calcular nuevos puntos
        const nuevosPuntos = (puntajesDoc.data()['puntos'] || 0) + puntosAsignados;
  
        // Actualizar el documento con los nuevos puntos acumulados y la fecha actual
        await updateDoc(doc(puntajesRef, puntajesDocId), {
          puntos: nuevosPuntos,
          fecha: new Date() // Actualizar la fecha a la actual
        });
      } else {
        // Si no existe el documento, crear uno nuevo
        await addDoc(puntajesRef, {
          puntos: puntosAsignados,
          fecha: new Date() // Guardar la fecha de creación
        });
      }
  
      // Guardar el ejercicio completado en Firestore
      await this.guardarEjercicioCompletado(ejercicio, currentUser.uid);
  
      // Mensaje de éxito
      this.mostrarPuntosToast(puntosAsignados); // Usar la función para mostrar el mensaje
  
      // Reemplazar el ejercicio completado en la lista
      const ejercicioIndex = this.ejerciciosDelDia.indexOf(ejercicio);
      if (ejercicioIndex > -1) {
        // Actualizar la propiedad completado del ejercicio
        this.ejerciciosDelDia[ejercicioIndex].completado = true;
        // Reemplazar toda la información con "Ejercicio completado"
        this.ejerciciosDelDia[ejercicioIndex].nombre_ejercicio = 'Ejercicio completado';
        this.ejerciciosDelDia[ejercicioIndex].duracion = null;
        this.ejerciciosDelDia[ejercicioIndex].series = null;
        this.ejerciciosDelDia[ejercicioIndex].repeticiones = null;
        this.ejerciciosDelDia[ejercicioIndex].gifUrl = null; // Opcional, si quieres ocultar el GIF
  
        // Guardar el estado del ejercicio en localStorage
        this.guardarEjerciciosEnLocalStorage();
      }
    } else {
      this.mostrarToast('Debes iniciar sesión para completar un ejercicio.', 'warning');
    }
  }
  
  
  
  
  // Función para guardar los ejercicios en localStorage
  guardarEjerciciosEnLocalStorage() {
    localStorage.setItem('ejerciciosDelDia', JSON.stringify(this.ejerciciosDelDia));
  }
  
  
  
  
  
  
  
  async mostrarPuntosToast(puntos: number) {
    const message = `¡Genial! Se te han asignado ${puntos} puntos.`;
    const toast = await this.toastController.create({
        message,
        duration: 3000,
        position: 'middle', // Cambiado para que aparezca en el medio
        color: 'success',
        cssClass: 'custom-toast' // Clase CSS personalizada
    });
    toast.present();
}


  
}
