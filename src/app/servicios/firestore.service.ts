import { inject, Injectable } from '@angular/core';
import { collectionData, Firestore, doc, docData  } from '@angular/fire/firestore';
import { collection, CollectionReference, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { catchError, map, Observable, of } from 'rxjs';
import { Equipos, Logros, Partidos } from '../modelos/equipos.models';
import { DocumentData } from 'firebase/firestore/lite';
import { Timestamp } from 'firebase/firestore';
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  firestore: Firestore = inject(Firestore)


  constructor() { }

  getcolleccionChanges<tipo>(path: string){
    const itemCollection = collection(this.firestore, path);
    return collectionData(itemCollection) as Observable<tipo[]>;
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
  async getRutinaDelDia(uid: string): Promise<any> {
    const rutinaRef = doc(this.firestore, `usuarios/${uid}/rutinas/rutina_semanal`);
    const rutinaSnapshot = await getDoc(rutinaRef);
  
    if (rutinaSnapshot.exists()) {
      return rutinaSnapshot.data(); // Retorna el mapa de rutinas
    } else {
      console.log('No se encontró rutina semanal para el usuario:', uid);
      return null;
    }
  }
  
    async getEjerciciosPorRutina(tipoRutina: string): Promise<any[]> {
    const tipoRutinaRef = collection(this.firestore, 'Rutinas', 'tipo_rutina');
    const ejerciciosQuery = query(tipoRutinaRef, where('rutina', '==', tipoRutina));
    const querySnapshot = await getDocs(ejerciciosQuery);
  
    const ejercicios: any[] = [];
    querySnapshot.forEach((doc) => {
      ejercicios.push({ id: doc.id, ...doc.data() }); // Agrega los ejercicios a la lista
    });
  
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
}