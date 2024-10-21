import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, User,setPersistence, browserLocalPersistence, onAuthStateChanged} from '@angular/fire/auth';
import { Firestore, doc, setDoc,getDoc  } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Usuario } from '../modelos/equipos.models';
import { collection, getDocs } from 'firebase/firestore';
import { Equipos } from '../modelos/equipos.models';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: User | null = null;

  constructor(private auth: Auth, private firestore: Firestore,
    private storage: Storage,) { }

  signIn(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }
  async registrarUsuario(usuario: Usuario, password: string): Promise<void> {
    const { correo } = usuario;
    
    // Crear usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(this.auth, correo, password);
    
      // Guardar el usuario en Firestore
      const userRef = doc(this.firestore, `usuarios/${userCredential.user.uid}`);
      await setDoc(userRef, { ...usuario, uid: userCredential.user.uid });
    }

    async getCurrentUser(): Promise<User | null> {
      return new Promise((resolve) => {
        const user = this.auth.currentUser; // Devuelve el usuario actual
        resolve(user);
      });
    }

    // Método para cerrar sesión
  async signOut() {
    try {
      await this.auth.signOut(); // Llama a la función de cierre de sesión de Firebase Auth
    } catch (error) {
      console.error('Error al cerrar sesión: ', error);
    }
  }
  
 
   
  
  
}


