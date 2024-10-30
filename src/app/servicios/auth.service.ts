import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, User, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Storage  } from '@angular/fire/storage';
import { Usuario } from '../modelos/equipos.models';
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence} from 'firebase/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: User | null = null;

  constructor(private auth: Auth, private firestore: Firestore,
    private storage: Storage,private router: Router) { }

  signIn(email: string, password: string) {
    const auth = getAuth();

    setPersistence(auth, browserLocalPersistence);
    return signInWithEmailAndPassword(this.auth, email, password);
  }
  verificarAutenticacion() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // Usuario autenticado, puedes realizar acciones adicionales si es necesario
        console.log('Usuario autenticado:', user);
      } else {
        // Usuario no autenticado, redirige al inicio de sesión
        console.log('Usuario no autenticado, redirigiendo a login...');
        this.router.navigate(['/login']); // Ajusta según tu ruta
      }
    });
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


