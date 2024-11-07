import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, User, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc, getFirestore, setDoc } from '@angular/fire/firestore';
import { Storage  } from '@angular/fire/storage';
import { Usuario } from '../modelos/equipos.models';
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { NotificacionService } from './notificaciones-service.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: User | null = null;
  user$: Observable<User | null>;
  isAdmin: boolean = false; // Variable para almacenar el estado de administrador
  user: any = null;

  constructor(private auth: Auth, private firestore: Firestore,
              private storage: Storage, private router: Router, private notificationService: NotificacionService) {
    // Inicializa el observable de usuario
    this.user$ = new Observable<User | null>(observer => {
      const auth = getAuth();
      onAuthStateChanged(auth, user => {
        observer.next(user);
        if (user) {
          this.currentUser = user; // Guarda el usuario actual
        } else {
          this.currentUser = null; // No hay usuario autenticado
        }
      });
    });
  }

    signIn(email: string, password: string) {
      const auth = getAuth();
      const db = getFirestore();
    
      return signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
          const user = userCredential.user;
          const userId = user.uid;
    
          // Consulta en Firestore para verificar el perfil
          const userDocRef = doc(db, "usuarios", userId);
          return getDoc(userDocRef).then(userDocSnap => {
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              const isAdmin = userData['perfil'] === "administrador";
    
              if (isAdmin) {
                console.log("El usuario es administrador");
                // Acciones específicas para administrador
              } else {
                console.log("El usuario es estándar");
                // Acciones para usuario estándar
              }
    
              return { isAdmin, user };
            } else {
              console.log("No se encontró el documento del usuario");
              return null;
            }
          });
        })
        .catch(error => {
          console.error("Error en el inicio de sesión:", error);
          throw error;
        });
    }
    
    verificarAutenticacion() {
      const auth = getAuth();
      const db = getFirestore();
  
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log('Usuario autenticado:', user);
          this.user = user; // Almacena el usuario
  
          // Verifica el perfil del usuario en Firestore
          const userDocRef = doc(db, "usuarios", user.uid);
          getDoc(userDocRef).then(userDocSnap => {
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              this.isAdmin = userData['perfil'] === "administrador";
              console.log("Perfil de usuario cargado:", this.isAdmin ? "Administrador" : "Usuario estándar");
            } else {
              console.log("No se encontró el documento del usuario en Firestore");
              this.isAdmin = false;
            }
          }).catch(error => {
            console.error("Error al consultar el perfil del usuario:", error);
            this.isAdmin = false;
          });
        } else {
          console.log('Usuario no autenticado, redirigiendo a login...');
          this.router.navigate(['/login']);
        }
      });
    }
  
    // Método para verificar el rol de administrador desde otros componentes
    esAdministrador(): boolean {
      return this.isAdmin;
    }
  
    async registrarUsuario(usuario: Usuario, password: string): Promise<void> {
      const { correo } = usuario;
      const userCredential = await createUserWithEmailAndPassword(this.auth, correo, password);
      const userRef = doc(this.firestore, `usuarios/${userCredential.user.uid}`);
      
      // Guarda los datos del usuario en Firestore con su UID
      await setDoc(userRef, { ...usuario, uid: userCredential.user.uid });
      
      // Inicializa las notificaciones para generar y guardar el token en Firestore
      await this.notificationService.initPushNotifications();
    }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  async signOut() {
    try {
      await signOut(this.auth);
      console.log('Sesión cerrada correctamente');
      window.location.href = '/login'; // Ajusta esta ruta según tu aplicación
    } catch (error) {
      console.error('Error al cerrar sesión: ', error);
    }
  }

  getUserId(): string | null {
    const user = this.auth.currentUser;
    return user ? user.uid : null;
  }
}
export { Auth };

