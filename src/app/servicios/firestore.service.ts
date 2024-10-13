import { inject, Injectable } from '@angular/core';
import { collectionData, Firestore, doc, docData  } from '@angular/fire/firestore';
import { collection, CollectionReference, query, where } from 'firebase/firestore';
import { catchError, map, Observable } from 'rxjs';
import { Equipos, Logros, Partidos } from '../modelos/equipos.models';
import { DocumentData } from 'firebase/firestore/lite';

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
                fecha: item['fecha'].toDate() // Asegúrate de que 'fecha' es un Timestamp
            })) as Logros[];
        }),
        catchError(error => {
            console.error('Error obteniendo logros:', error);
            return of([]); // Retorna un array vacío en caso de error
        })
    ) as Observable<Logros[]>;
}
  logrosCollection(logrosCollection: any, equipoId: string) {
    throw new Error('Method not implemented.');
  }
  getPartidosPorEquipo(equipoId: string): Observable<Partidos[]> {
    const partidosCollection = collection(this.firestore, `equipos/${equipoId}/partidos`);
    return collectionData(partidosCollection, { idField: 'id' }) as Observable<Partidos[]>;
  }

}
function of(arg0: never[]): any {
  throw new Error('Function not implemented.');
}

