import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, User, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { Usuario } from '../modelos/equipos.models';
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: User | null = null;
  user$: Observable<User | null>;

  constructor(private auth: Auth, private firestore: Firestore,
              private storage: Storage, private router: Router) {
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
    setPersistence(auth, browserLocalPersistence);
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  verificarAutenticacion() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Usuario autenticado:', user);
      } else {
        console.log('Usuario no autenticado, redirigiendo a login...');
        this.router.navigate(['/login']); // Ajusta según tu ruta
      }
    });
  }

  async registrarUsuario(usuario: Usuario, password: string): Promise<void> {
    const { correo } = usuario;
    const userCredential = await createUserWithEmailAndPassword(this.auth, correo, password);
    const userRef = doc(this.firestore, `usuarios/${userCredential.user.uid}`);
    await setDoc(userRef, { ...usuario, uid: userCredential.user.uid });
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
