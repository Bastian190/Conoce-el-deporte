import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, User, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc, getFirestore, setDoc } from '@angular/fire/firestore';
import { Storage  } from '@angular/fire/storage';
import { Usuario } from '../modelos/equipos.models';
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence} from 'firebase/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: User | null = null;
  isAdmin: boolean = false; // Variable para almacenar el estado de administrador
  user: any = null;

  constructor(private auth: Auth, private firestore: Firestore,
    private storage: Storage,private router: Router) { }

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
    
    // Crear usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(this.auth, correo, password);
    
      // Guardar el usuario en Firestore
      const userRef = doc(this.firestore, `usuarios/${userCredential.user.uid}`);
      await setDoc(userRef, { ...usuario, uid: userCredential.user.uid });
    }

    getCurrentUser(): User | null {
      return this.auth.currentUser; // Devuelve el usuario actual, o null si no hay ninguno
    }

    // Método para cerrar sesión
    async signOut() {
      try {
        await signOut(this.auth); // Llama a la función de cierre de sesión de Firebase Auth
        console.log('Sesión cerrada correctamente');
        // Aquí puedes redirigir al usuario a la página de inicio de sesión
        window.location.href = '/login'; // Ajusta esta ruta según tu aplicación
      } catch (error) {
        console.error('Error al cerrar sesión: ', error);
      }
    }
  getUserId(): string | null {
    const user = this.auth.currentUser;
    return user ? user.uid : null; // Retorna el ID del usuario o null si no hay usuario autenticado
  }

  
 
   
  
  
}


