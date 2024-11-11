import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service'; // Asegúrate de que la ruta sea correcta
import { Usuario } from '../../modelos/equipos.models'; // Asegúrate de que la ruta sea correcta
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, sendEmailVerification,User } from 'firebase/auth'; // Importa el método sendEmailVerification
import { NotificacionService } from 'src/app/servicios/notificaciones-service.service';
import { PushNotifications } from '@capacitor/push-notifications';
import { doc, updateDoc } from 'firebase/firestore';
import { getMessaging, getToken } from 'firebase/messaging';
import { collectionData, Firestore } from '@angular/fire/firestore';
@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent implements OnInit {
  registroForm!: FormGroup;
  fotoPerfil: string | ArrayBuffer | null = null; // Almacena la imagen de perfil
  storage: any;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private authService: AuthService,
    private notificacionService: NotificacionService, // Inyectar el servicio
    private firestore: Firestore,
  ) {
    this.storage = getStorage(); // Inicializa el almacenamiento
  }

  ngOnInit(): void {
    this.registroForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      lastname: ['', [Validators.required]],
      altura: ['', [Validators.min(0)]],
      peso: ['', [Validators.min(0)]],
      correo: ['', [Validators.required, Validators.email]],
      date: ['', [Validators.required]],
      sex: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordRepeat: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  async obtenerTokenFCM() {
    const messaging = getMessaging(); // Inicializa el mensajería
    try {
      const currentToken = await getToken(messaging, { vapidKey: 'TU_CLAVE_VAPID' });
      if (currentToken) {
        console.log('Token de FCM obtenido:', currentToken);
        return currentToken;
      } else {
        console.log('No se pudo obtener el token de FCM. Asegúrate de que se hayan otorgado los permisos de notificación.');
        return null; // Retorna null si no se obtiene el token
      }
    } catch (error) {
      console.error('Error al obtener el token de FCM:', error);
      return null; // Maneja el error y retorna null
    }
  }
  

  async registrar() {
    if (!this.validarFormulario()) {
      return; // Si la validación falla, salimos de la función
    }
  
    const { password, passwordRepeat } = this.registroForm.value;
    if (password.length < 6) {
      this.mostrarToast('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== passwordRepeat) {
      this.mostrarToast('Las contraseñas no coinciden');
      return;
    }
  
    const fechaNacimiento = new Date(this.registroForm.value.date);
    const fotoPerfilUrl = await this.subirFotoPerfil();
  
    const usuario: Usuario = {
      nombre: this.registroForm.value.name,
      apellido: this.registroForm.value.lastname,
      fechaNacimiento: fechaNacimiento,
      sexo: this.registroForm.value.sex,
      altura: this.registroForm.value.altura,
      peso: this.registroForm.value.peso,
      correo: this.registroForm.value.correo,
      ...(fotoPerfilUrl && { fotoPerfil: fotoPerfilUrl })
    };
  
    try {
      // Registra al usuario en Firebase
      await this.authService.registrarUsuario(usuario, password);
  
      // Obtén el usuario actual después del registro
      const auth = getAuth();
      const currentUser = auth.currentUser;
  
      if (currentUser) {
        // Obtén el token FCM para notificaciones
        const fcmToken = await this.obtenerTokenFCM();
        
        if (fcmToken) {
          // Almacena el token en Firestore
          const userDocRef = doc(this.firestore, `usuarios/${currentUser.uid}`);
          await updateDoc(userDocRef, { fcmToken: fcmToken });
          console.log('Token de FCM guardado en Firestore');
        }
  
        // Envía el correo de verificación
        await sendEmailVerification(currentUser);
        this.mostrarToast('Registro exitoso, verifica tu correo electrónico antes de iniciar sesión.', 'success');
        await this.notificacionService.initPushNotifications();
        // Esperar a que el correo esté verificado
        await this.esperarVerificacionCorreo(currentUser);
  
        // Navegación a la página de registro de rutina
        this.router.navigate(['registroRutina']);
      } else {
        this.mostrarToast('Error: No se pudo obtener el usuario autenticado.');
      }
  
    } catch (error: any) {
      console.error('Error al registrar el usuario:', error);
      this.mostrarToast('Error al registrar el usuario: ' + (error.message || error));
    }
  }
  
  
  

  async esperarVerificacionCorreo(user: User) {
    return new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        await user.reload(); // Recarga el usuario para obtener el estado actualizado
        const updatedUser = getAuth().currentUser; // Obtén el usuario actualizado

        if (updatedUser?.emailVerified) {
          clearInterval(interval); // Detenemos el intervalo
          resolve(); // Resolvemos la promesa
        }
      }, 3000); // Comprueba cada 3 segundos
    });
  }
  
  async subirFotoPerfil(): Promise<string | undefined> {
    const inputFile = document.querySelector('input[type="file"]') as HTMLInputElement;
  
    if (inputFile?.files && inputFile.files.length > 0) {
      try {
        const file = inputFile.files[0];
        const filePath = `fotos_perfil/${new Date().getTime()}_${file.name}`;
        const storageRef = ref(this.storage, filePath);
  
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      } catch (error: any) {
        console.error('Error al subir la foto de perfil:', error.message || error);
        this.mostrarToast('Error al subir la foto de perfil: ' + (error.message || error));
        return undefined;
      }
    }
  
    return undefined;
  }
  
  
  
  async mostrarToast(message: string, color: string = 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }

  validarFormulario() {
    const correoControl = this.registroForm.get('correo');
    const fechaNacimientoControl = this.registroForm.get('date');
  
    const camposVacios = Object.keys(this.registroForm.controls).some(control => {
      const formControl = this.registroForm.get(control);
      return formControl ? !formControl.value : true; // Verifica si el valor del control está vacío
    });
  
    if (camposVacios) {
      this.mostrarToast('Por favor, completa todos los campos obligatorios.');
      return false;
    }
  
    if (correoControl && correoControl.invalid && correoControl.touched) {
      this.mostrarToast('El correo está mal escrito, vuelva a intentar');
      return false;
    }
  
    // Validar la fecha de nacimiento
    const fechaNacimiento = new Date(fechaNacimientoControl?.value);
    const hoy = new Date();
    const edadMinima = new Date(hoy.getFullYear() - 55, hoy.getMonth(), hoy.getDate());
    const edadMaxima = new Date(hoy.getFullYear() - 14, hoy.getMonth(), hoy.getDate());
  
    if (fechaNacimiento < edadMinima || fechaNacimiento > edadMaxima) {
      this.mostrarToast('La edad debe estar entre 14 y 55 años.');
      return false;
    }
  
    return true;
  }
  
  cargarFoto(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPerfil = reader.result; // Almacena el resultado como base64 para mostrar la imagen
      };
      reader.readAsDataURL(file); // Lee el archivo como Data URL
    }
  }

  irAPaginaDestino1() {
    this.router.navigate(['login']); // Cambia 'login' por la ruta correcta de tu página de inicio de sesión
  }
}
