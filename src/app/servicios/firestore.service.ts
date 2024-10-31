import { inject, Injectable } from '@angular/core';
import { collectionData, Firestore, doc, docData,serverTimestamp  } from '@angular/fire/firestore';
import { collection, CollectionReference, deleteDoc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { catchError, map, Observable, of } from 'rxjs';
import { Equipos, Logros, Partidos } from '../modelos/equipos.models';
import { DocumentData } from 'firebase/firestore/lite';
import { Timestamp } from 'firebase/firestore';
import { AuthService } from './auth.service'; 


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  firestore: Firestore = inject(Firestore)


  constructor(private authService: AuthService) { }

  getcolleccionChanges<T>(nombreColeccion: string): Observable<T[]> {
    const coleccionRef = collection(this.firestore, nombreColeccion); // Asegúrate de que esto es correcto
    return collectionData(coleccionRef, { idField: 'id' }) as Observable<T[]>; // Devuelve la colección
  }
    getEquipoPorNombre(nombreEquipo: string): Observable<string | null> {
      const equiposCollection = collection(this.firestore, 'Equipos') as CollectionReference<DocumentData>;
      const q = query(equiposCollection, where('nombre_equipo', '==', nombreEquipo));
  
      return collectionData(q, { idField: 'id' }).pipe(
          map((equipos) => {
              // Eliminar la necesidad de DocumentData directamente
              const equiposMapeados = equipos.map((equipo: any) => ({
                  id: equipo.id,
                  nombre_equipo: equipo.nombre_equipo,
                  // Otras propiedades que necesites mapear
              })) as Equipos[];
  
              if (equiposMapeados.length > 0) {
                  return equiposMapeados[0].id; // Retorna el ID del equipo
              } else {
                  return null; // Retorna null si no se encuentra el equipo
              }
          })
      );
  }
     // Leer documentos de una subcolección
  getSubdocumentos<tipo>(coleccion: string, documento: string, subcoleccion: string): Observable<tipo[]> {
    const path = `${coleccion}/${documento}/${subcoleccion}`;
    const subCollection = collection(this.firestore, path);
    return collectionData(subCollection) as Observable<tipo[]>;
  }

  getLogrosPorEquipo(equipoId: string): Observable<Logros[]> {
    const logrosCollection = collection(this.firestore, `Equipos/${equipoId}/Logros`);
    console.log('Consulta a la colección:', logrosCollection); // Verifica que la referencia sea correcta

    return collectionData(logrosCollection, { idField: 'id' }).pipe(
        map((data: DocumentData[]) => {
            console.log('Datos obtenidos de Firestore:', data); // Verifica los datos que llegan
            return data.map(item => ({
                id: item['id'],
                logro: item['logro'],
                fecha: item['fecha'] // Asegúrate de que 'fecha' es un Timestamp
            })) as Logros[];
        }),
        catchError(error => {
            console.error('Error obteniendo logros:', error);
            return of([]); // Retorna un array vacío en caso de error
        })
    ) as Observable<Logros[]>;
    }

  getPartidosPorEquipo(equipoId: string): Observable<Partidos[]> {
    const partidosCollection = collection(this.firestore, `Equipos/${equipoId}/Partidos`);
    return collectionData(partidosCollection, { idField: 'id' }).pipe(
      map((data: DocumentData[]) => {
        return data.map(item => ({
          id: item['id'],                
          contrincante: item['contrincante'],
          resultado: item['resultado'],
          fecha_partido: item['fecha_partido'].toDate(), // Si es un Timestamp de Firestore
          ubicacion: item['ubicacion']
        })) as Partidos[];
      }),
      catchError(error => {
        console.error('Error obteniendo partidos:', error);
        return of([]); // Retorna un array vacío en caso de error
      })
    ) as Observable<Partidos[]>;
  }
  async guardarRutina(uid: string, rutinaSeleccionada: any, intensidadSeleccionada: string | null): Promise<void> {
    // Ruta a la subcolección "rutinas" del usuario
    const userRutinaRef = doc(this.firestore, `usuarios/${uid}/rutinas`, 'rutina_semanal');
    
    const data = {
      rutina: rutinaSeleccionada,
      intensidad: intensidadSeleccionada,
      fecha: new Date() // Añade una fecha para saber cuándo se creó la rutina
    };

    try {
      // Crear o actualizar la rutina en la subcolección
      await setDoc(userRutinaRef, data, { merge: true });  // `merge: true` asegura que si ya existe, se actualice
      console.log("Rutina guardada correctamente en la subcolección.");
    } catch (error) {
      console.error("Error al guardar la rutina en la subcolección: ", error);
      throw error;  // Lanza el error para manejarlo en el componente
    }
  }
  async getRutinaDelDia(uid: string, dia: string): Promise<any> {
    // Referencia al documento de rutina_semanal del usuario
    const rutinaRef = doc(this.firestore, `usuarios/${uid}/rutinas/rutina_semanal`);
    
    // Obtener el snapshot del documento
    const rutinaSnapshot = await getDoc(rutinaRef);
  
    // Verificar si el documento existe
    if (rutinaSnapshot.exists()) {
      // Obtener los datos del documento
      const rutinaData = rutinaSnapshot.data();
  
      // Asegurarse de que existe el campo 'rutina_semanal'
      if (rutinaData && rutinaData['rutina']) {
        const rutinaSemanal = rutinaData['rutina'];
  
        // Verificar si hay datos para el día específico en el mapa de rutina_semanal
        if (rutinaSemanal[dia]) {
          console.log(`Rutina para el día ${dia}:`, rutinaSemanal[dia]);
          return rutinaSemanal[dia]; // Retorna la rutina para el día específico
        } else {
          console.log(`No se encontró rutina para el día: ${dia}`);
          return null; // No hay rutina para el día solicitado
        }
      } else {
        console.log('El campo "rutina" no se encontró en rutina_semanal.');
        return null;
      }
    } else {
      console.log('No se encontró el documento rutina_semanal para el usuario:', uid);
   }
 }

   async agregarEquipoSeguido(uid: string, equipoId: string, tipoNotificacion: string) {
    try {
      const usuarioRef = doc(this.firestore, `usuarios/${uid}/equiposSeguidos/${equipoId}`);
      await setDoc(usuarioRef, {
        equipoId: equipoId,
        tipoNotificacion: tipoNotificacion,
        timestamp: serverTimestamp(), // Usar serverTimestamp directamente
      });
      console.log('Equipo seguido agregado correctamente');
    } catch (error) {
      console.error('Error al seguir el equipo:', error);
    }
  }
  async verificarEquipoSeguido(uid: string, equipoId: string): Promise<boolean> {
    try {
      const usuarioRef = doc(this.firestore, `usuarios/${uid}/equiposSeguidos/${equipoId}`);
      const docSnapshot = await getDoc(usuarioRef);
  
      return docSnapshot.exists(); // Devuelve true si el documento existe, false si no
    } catch (error) {
      console.error('Error al verificar si el equipo está seguido:', error);
      return false; // En caso de error, devuelve false
    }
  }

  // Función para obtener los equipos seguidos por el usuario
  async obtenerEquiposSeguidos(uid: string): Promise<string[]> {
    const equiposSeguidosRef = collection(this.firestore, `usuarios/${uid}/equiposSeguidos`);
    const equiposSeguidosSnapshot = await getDocs(equiposSeguidosRef);

    const equiposSeguidos: string[] = [];

    equiposSeguidosSnapshot.forEach((doc) => {
      equiposSeguidos.push(doc.data()['equipoId']); // Agrega el ID de cada equipo seguido
    });

    return equiposSeguidos;
  }

  // Función para obtener los datos completos del equipo a partir de su ID
  async obtenerDatosEquipo(equipoId: string): Promise<Equipos | null> {
    const equipoRef = doc(this.firestore, `Equipos/${equipoId}`);
    const equipoSnapshot = await getDoc(equipoRef);

    if (equipoSnapshot.exists()) {
      return equipoSnapshot.data() as Equipos;
    } else {
      console.log('Equipo no encontrado');
      return null;
    }
  }
  


  
  // Función para obtener ejercicios por rutina
async getEjerciciosPorRutina(nombreTipoRutina: string): Promise<any[]> {
  const rutinasRef = collection(this.firestore, 'Rutinas'); // Referencia a la colección de Rutinas
  const ejercicios: any[] = [];

  // Obtener todos los documentos de la colección 'Rutinas'
  const rutinasSnapshot = await getDocs(rutinasRef);

  for (const rutinaDoc of rutinasSnapshot.docs) {
    // Obtener la subcolección 'Tipo_rutina'
    const tipoRutinaRef = collection(this.firestore, `Rutinas/${rutinaDoc.id}/Tipo_rutina`);

    // Consulta para ejercicios que coincidan con el nombre de la rutina
    const ejerciciosQuery = query(tipoRutinaRef, where('nombre_tipo_rutina', '==', nombreTipoRutina));
    const querySnapshot = await getDocs(ejerciciosQuery);

    // Añadir los ejercicios encontrados al array
    querySnapshot.forEach((doc) => {
      ejercicios.push({ id: doc.id, ...doc.data() });
    });
  }

  return ejercicios;
}

// Función para obtener ejercicios de calentamiento
async getEjerciciosPorTipo(tipoEjercicio: string): Promise<any[]> {
  const rutinasRef = collection(this.firestore, 'Rutinas'); // Referencia a la colección de Rutinas
  const ejercicios: any[] = [];

  // Obtener todos los documentos de la colección 'Rutinas'
  const rutinasSnapshot = await getDocs(rutinasRef);

  for (const rutinaDoc of rutinasSnapshot.docs) {
      // Obtener la subcolección 'Tipo_rutina'
      const tipoRutinaRef = collection(this.firestore, `Rutinas/${rutinaDoc.id}/Tipo_rutina`);

      // Consulta para obtener los ejercicios donde 'nombre_tipo_rutina' sea del tipo solicitado
      const ejerciciosQuery = query(tipoRutinaRef, where('nombre_tipo_rutina', '==', tipoEjercicio));
      const querySnapshot = await getDocs(ejerciciosQuery);

      // Añadir los ejercicios encontrados al array
      querySnapshot.forEach((doc) => {
          ejercicios.push({ id: doc.id, ...doc.data() });
      });
  }

  return ejercicios;
}

  
  getDocument<tipo>(collectionPath: string, docId: string) {
    const docRef = doc(this.firestore, collectionPath, docId);
    return docData(docRef) as Observable<tipo>;
  }
  updateUserProfile(uid: string, data: any) {
    const userDocRef = doc(this.firestore, 'usuarios', uid); // Cambia 'usuarios' por tu colección real
    return updateDoc(userDocRef, data);
  }

  dejarDeSeguirEquipo(uid: string, equipoId: string) {
    const userRef = doc(this.firestore, `usuarios/${uid}`);
    const equiposSeguidosRef = collection(this.firestore, `${userRef.path}/equiposSeguidos`);
    
    return deleteDoc(doc(equiposSeguidosRef, equipoId));
}
async getIntensidadRutina(userId: string): Promise<any> {
  const docRef = doc(this.firestore, `usuarios/${userId}/rutinas/rutina_semanal`); // Asegúrate de que la ruta es correcta
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Documento encontrado:", data);
      
      // Asegúrate de que el campo 'intensidad' existe
      if (data && data['intensidad']) { // Cambiado a notación de corchetes
          return { intensidad: data['intensidad'] }; // Devuelve solo el campo intensidad
      } else {
          console.warn(`No se encontró el campo 'intensidad' en el documento de rutina_semanal.`);
          return null; // Si el campo 'intensidad' no existe, devuelve null
      }
  } else {
      console.log(`No se encontró el documento de intensidad en usuarios/${userId}/rutinas/rutina_semanal`);
      return null; // Si no existe el documento, devuelve null
  }
}






  

}