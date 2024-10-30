import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence, signInWithEmailAndPassword } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private router: Router) {}

  async iniciarSesion(email: string, password: string) {
    const auth = getAuth();

    // Establece la persistencia
    await setPersistence(auth, browserLocalPersistence);

    // Inicia sesión
    return signInWithEmailAndPassword(auth, email, password);
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
}
