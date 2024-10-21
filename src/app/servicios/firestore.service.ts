import { inject, Injectable } from '@angular/core';
import { collectionData, Firestore, doc, docData, setDoc,serverTimestamp} from '@angular/fire/firestore';
import { collection, CollectionReference, getDoc, query, where } from 'firebase/firestore';
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
  
  
}