import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuario } from '../modelos/equipos.models';
import { addDoc, collection, collectionGroup, Firestore, getDocs, doc, getDoc, onSnapshot} from '@angular/fire/firestore';
import { AuthService } from '../servicios/auth.service';
import { User } from 'firebase/auth';
@Component({
  selector: 'app-tab1',
  templateUrl: 'Inicio.page.html',
  styleUrls: ['Inicio.page.scss']
})
export class Inicio {
  nombreUsuario: string | null = null;
  usuario: Usuario []=[];
  puntajes: any[] = [];
  constructor(private activeroute: ActivatedRoute, private router: Router, private firestore: Firestore, private authService: AuthService) {
  }
  obtenerPuntajes(): void {
    const puntajesRef = collectionGroup(this.firestore, 'puntajes');

    // Usar onSnapshot para escuchar cambios en tiempo real
    onSnapshot(puntajesRef, async (querySnapshot) => {
        const puntajes: any[] = [];

        // Iterar sobre cada documento de puntaje
        const promises = querySnapshot.docs.map(async (puntajeDoc) => {
            const puntajeData = puntajeDoc.data();
            const usuarioId = puntajeDoc.ref.parent.parent?.id;

            if (usuarioId) {
                const usuarioDocRef = doc(this.firestore, `usuarios/${usuarioId}`);
                
                try {
                    const usuarioDoc = await getDoc(usuarioDocRef);
                    if (usuarioDoc.exists()) {
                        const usuarioData = usuarioDoc.data();
                        puntajes.push({
                            id: puntajeDoc.id,
                            puntos: puntajeData['puntos'] || 0,
                            nombreUsuario: usuarioData['nombre'] || 'Usuario desconocido',
                            apellidoUsuario: usuarioData['apellido'] || ''
                        });
                    }
                } catch (error) {
                    console.error(`Error al obtener datos del usuario ${usuarioId}:`, error);
                }
            }
        });

        // Esperar a que todas las promesas se resuelvan
        await Promise.all(promises);
        this.puntajes = puntajes; // Asignar los puntajes una vez que todo se haya completado
        this.puntajes.sort((a, b) => (b.puntos || 0) - (a.puntos || 0));
        console.log('Puntajes obtenidos:', this.puntajes); // Verifica los datos aquí
    }, (error) => {
        console.error('Error al escuchar los puntajes:', error);
    });
}


  ngOnInit() {
    this.obtenerPuntajes(); // Llama a la función para obtener puntajes
    const user: User | null = this.authService.getCurrentUser();
    console.log('Usuario actual:', user); // Agregar esto para verificar el usuario
    if (user) {
      this.nombreUsuario = user.displayName || 'Usuario'; // Valor por defecto
    } else {
      this.nombreUsuario = 'Usuario'; // Si no hay usuario, establecer como null
    }
  }
}