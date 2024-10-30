import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuario } from '../modelos/equipos.models';
import { addDoc, collection, collectionGroup, Firestore, getDocs, doc, getDoc} from '@angular/fire/firestore';
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
    // Nos suscribimos a los parámetros de la ruta
    this.activeroute.queryParams.subscribe(params => {
      // Verificamos si hay una navegación activa y si el estado contiene datos
      const navigation = this.router.getCurrentNavigation();
      if (navigation && navigation.extras.state) {
        this.usuario = navigation.extras.state['usuario'];
        console.log(this.usuario);
      } else {
        console.log('No hay navegación activa o no hay datos en el estado.');
      }
    });
  }
  async obtenerPuntajes(): Promise<void> {
    const puntajesRef = collectionGroup(this.firestore, 'puntajes');
    const querySnapshot = await getDocs(puntajesRef);
  
    const puntajes: any[] = [];
    for (const puntajeDoc of querySnapshot.docs) {
      const puntajeData = puntajeDoc.data();
      
      const usuarioId = puntajeDoc.ref.parent.parent?.id;
      if (usuarioId) {
        const usuarioDocRef = doc(this.firestore, `usuarios/${usuarioId}`);
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
      }
    }
  
    puntajes.sort((a, b) => (b.puntos || 0) - (a.puntos || 0));
    
    this.puntajes = puntajes;
  
    console.log(this.puntajes); // Verifica los datos aquí
  }
  ngOnInit() {
    this.obtenerPuntajes().then(() => {
      console.log('Puntajes obtenidos:', this.puntajes);
    }).catch(error => {
      console.error('Error al obtener los puntajes:', error);
    });
    const user: User | null = this.authService.getCurrentUser();
    console.log('Usuario actual:', user); // Agregar esto para verificar el usuario
    if (user) {
      this.nombreUsuario = user.displayName || 'Usuario'; // Valor por defecto
    } else {
      this.nombreUsuario = null; // Si no hay usuario, establecer como null
    }
  }
}