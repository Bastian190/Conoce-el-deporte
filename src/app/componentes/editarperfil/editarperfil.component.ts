import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../../servicios/firestore.service';
import { AuthService } from 'src/app/servicios/auth.service';
import { User, getAuth, updateEmail, updatePassword, sendEmailVerification, signInWithEmailAndPassword,  EmailAuthProvider } from 'firebase/auth';
import { Usuario } from '../../modelos/equipos.models';
import { FirebaseApp, FirebaseError, getApp, initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-editarperfil',
  templateUrl: './editarperfil.component.html',
  styleUrls: ['./editarperfil.component.scss'],
})
export class EditarperfilComponent implements OnInit {
  userProfile: Usuario | null = null;
  correo: string = '';
  peso: number | null = null;
  altura: number | null = null;
  
  // Variables para la edición
  isEditingCorreo: boolean = false;
  isEditingPeso: boolean = false;
  isEditingAltura: boolean = false;
  isEditingPassword: boolean = false;
  currentPassword: string = '';
  newPassword: string = '';
  message: string = '';
 messageType: 'success' | 'error' = 'success';
 fotoPerfil: string | ArrayBuffer | null = null;
 nuevaFotoPerfil: File | null = null; // Variable para almacenar la foto seleccionada
 storage: FirebaseStorage;

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private alertController: AlertController,
    public toastController: ToastController,
    private router: Router,
    private firestoreService: FirestoreService,
    private authService: AuthService,
    
  ) {
    let app: FirebaseApp;
    try {
      app = getApp(); // Intenta obtener la instancia por defecto de Firebase
    } catch (e) {
      // Si no existe, inicializa Firebase
      app = initializeApp(environment.firebase);
    }
    this.storage = getStorage(app);
    }

  ngOnInit() {
    this.authService.user$.subscribe(userId => {
      if (userId) {
          this.firestoreService.getUserProfile(userId.uid)
              .then(profile => {
                  if (profile) {
                      this.userProfile = profile;
                      this.correo = profile.correo;
                      this.peso = profile.peso;
                      this.altura = profile.altura;
                  }
              })
              .catch(error => {
                  console.error('Error al obtener el perfil del usuario:', error);
              });
      }
    });
  }

  Atras() {
    this.navCtrl.back();
  }

  irAPaginaDestino() {
    this.router.navigate(['/tabs/configuracion']);
  }

  siguiente() {
    this.router.navigate(['/tabs/editar-perfil']);
  }

  toggleEditCorreo() {
    this.isEditingCorreo = !this.isEditingCorreo;
  }

  toggleEditPeso() {
    this.isEditingPeso = !this.isEditingPeso;
  }

  toggleEditAltura() {
    this.isEditingAltura = !this.isEditingAltura;
  }

  async saveCorreo() {
    const user = getAuth().currentUser;

    if (!user) {
        await this.showAlert('Error', 'No se pudo encontrar el usuario.');
        return;
    }

    if (!this.currentPassword) {
        await this.showAlert('Error', 'Por favor, ingresa tu contraseña actual para reautenticación.');
        return;
    }

    try {
        // Reautenticación
        if (user.email) {
            const reauthenticated = await this.reauthenticateUser(user.email, this.currentPassword);
            if (!reauthenticated) {
                await this.showAlert('Error', 'No se pudo reautenticar al usuario. Asegúrate de que la contraseña actual sea correcta.');
                return;
            }
        } else {
            await this.showAlert('Error', 'No se pudo encontrar el correo electrónico del usuario.');
            return; // Salir si el correo es null
        }

        // Intentar cambiar el correo
        await updateEmail(user, this.correo);
        
        // Al cambiar el correo, se enviará automáticamente un correo de verificación
        await sendEmailVerification(user); // Envío del correo de verificación

        // Actualizar el correo en Firestore
        const db = getFirestore(); // Obtener la instancia de Firestore
        const userDocRef = doc(db, 'usuarios', user.uid); // Cambia 'usuarios' por el nombre de tu colección de usuarios
        await updateDoc(userDocRef, {
            correo: this.correo // Actualiza el campo del correo
        });

        await this.showAlert('Éxito', 'Correo actualizado correctamente. Se ha enviado un correo de verificación a tu nueva dirección. Por favor, revisa tu correo y confirma el cambio.');

        this.toggleEditCorreo(); // Cierra el modo de edición
    } catch (error: unknown) {
        console.error('Error al actualizar el correo:', error);
        if (error instanceof FirebaseError) {
            if (error.code === 'auth/email-already-in-use') {
                await this.showAlert('Error', 'Este correo electrónico ya está en uso por otra cuenta.');
            } else if (error.code === 'auth/operation-not-allowed') {
                await this.showAlert('Error', 'La operación de cambio de correo no está permitida. Verifica la configuración de Firebase.');
            } else {
                await this.showAlert('Error', 'No se pudo actualizar el correo. Verifica tus datos.');
            }
        } else {
            await this.showAlert('Error', 'Ocurrió un error inesperado.'); // Manejo de errores genéricos
        }
    }
}









private async reauthenticateUser(email: string, password: string): Promise<boolean> {
  const user = getAuth().currentUser;
  if (user) {
      try {
          const credential = EmailAuthProvider.credential(email, password);
          await signInWithEmailAndPassword(getAuth(), email, password);
          return true; // Reautenticación exitosa
      } catch (error) {
          console.error('Error de reautenticación:', error);
          return false; // Reautenticación fallida
      }
  }
  return false;
}
async savePeso() {
    const userId = this.authService.getCurrentUser();
    if (userId) {
        const uid = userId.uid;
        const profileData = { peso: this.peso };
        try {
            await this.firestoreService.updateUserProfile(uid, profileData);
            await this.showAlert('Éxito', 'Peso actualizado correctamente.');
            this.toggleEditPeso();
        } catch (error) {
            console.error('Error al actualizar el peso:', error);
            await this.showAlert('Error', 'No se pudo actualizar el peso. Verifica tus datos.');
        }
    }
}

async saveAltura() {
    const userId = this.authService.getCurrentUser();
    if (userId) {
        const uid = userId.uid;
        const profileData = { altura: this.altura };
        try {
            await this.firestoreService.updateUserProfile(uid, profileData);
            await this.showAlert('Éxito', 'Altura actualizada correctamente.');
            this.toggleEditAltura();
        } catch (error) {
            console.error('Error al actualizar la altura:', error);
            await this.showAlert('Error', 'No se pudo actualizar la altura. Verifica tus datos.');
        }
    }
}

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  todosperfil(event: Event) {
    event.preventDefault();
    this.cdr.detectChanges();
  }

  async changePassword() {
    const user = getAuth().currentUser;
    const email = user?.email; // Obtener el correo del usuario

    if (user && this.newPassword && this.currentPassword) {
        // Reautenticar al usuario
        const reauthenticated = await this.reauthenticateUser(email!, this.currentPassword);
        if (!reauthenticated) {
            await this.showAlert('Error', 'Reautenticación fallida. Verifica tu contraseña actual.');
            return; // Salir si la reautenticación falla
        }

        // Cambiar la contraseña después de la reautenticación
        try {
            await updatePassword(user, this.newPassword);
            console.log('Contraseña cambiada con éxito');
            await this.showAlert('Éxito', 'La contraseña se ha cambiado correctamente.');
            this.toggleEditPassword(); // Cierra la edición de la contraseña
        } catch (error) {
            console.error('Error al cambiar la contraseña:', error);
            await this.showAlert('Error', 'No se pudo cambiar la contraseña. Asegúrate de que la contraseña actual sea correcta.');
        }
    } else {
        await this.showAlert('Error', 'Por favor, completa todos los campos.');
    }
}



toggleEditPassword() {
  this.isEditingPassword = !this.isEditingPassword;
}
cargarNuevaFoto(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.nuevaFotoPerfil = input.files[0];
  }
}

async subirFotoPerfil(file: File): Promise<string | undefined> {
  try {
    const filePath = `fotos_perfil/${new Date().getTime()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error: any) {
    console.error('Error al subir la foto de perfil:', error.message || error);
    return undefined;
  }
}

async actualizarFotoPerfil() {
  if (this.nuevaFotoPerfil) {
    try {
      // Subir la nueva foto al Storage y obtener la URL
      const nuevaUrlFoto = await this.subirFotoPerfil(this.nuevaFotoPerfil);
      
      if (nuevaUrlFoto) {
        console.log('Foto de perfil actualizada:', nuevaUrlFoto);
        this.mostrarAlerta('Atención','Se ha actualizado la foto de perfil.')
        // Obtener el uid del usuario actual
        const user = getAuth().currentUser;
        if (user) {
          const usuarioRef = doc(getFirestore(), 'usuarios', user.uid); // Referencia al documento del usuario

          // Actualizar el campo fotoPerfil en Firestore con la nueva URL
          await updateDoc(usuarioRef, {
            fotoPerfil: nuevaUrlFoto
          });

          console.log('Foto de perfil actualizada en Firestore');
        }
      } else {
        console.error('Error al obtener la URL de la foto de perfil');
      }
    } catch (error) {
      console.error('Error al actualizar la foto de perfil:', error);
    }
  } else {
    console.error('No se ha seleccionado una nueva foto de perfil');
  }
}
async mostrarAlerta(header: string, message: string, buttons: string[] = ['OK']) {
  const alert = await this.alertController.create({
    header,
    message,
    buttons,
  });
  await alert.present();
}
}