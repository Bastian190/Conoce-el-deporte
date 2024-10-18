import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service'; // Asegúrate de que la ruta sea correcta
import { Usuario } from '../../modelos/equipos.models'; // Asegúrate de que la ruta sea correcta
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
    private authService: AuthService // Inyectar el servicio
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
     // Llamamos a subirFotoPerfil y esperamos la URL o undefined
    const fotoPerfilUrl = await this.subirFotoPerfil();

    const usuario: Usuario = {
      nombre: this.registroForm.value.name,
      apellido: this.registroForm.value.lastname,
      fechaNacimiento: fechaNacimiento,
      sexo: this.registroForm.value.sex,
      altura: this.registroForm.value.altura,
      peso: this.registroForm.value.peso,
      correo: this.registroForm.value.correo,
      ...(fotoPerfilUrl && { fotoPerfil: fotoPerfilUrl }) // Carga la foto de perfil opcional
    };

    try {
      // Llamada al servicio para registrar el usuario
    await this.authService.registrarUsuario(usuario, password);
    this.mostrarToast('Registro exitoso', 'success');
    this.router.navigate(['registroRutina']);
    
  } catch (error: any) {
    console.error('Error al registrar el usuario:', error);
    this.mostrarToast('Error al registrar el usuario: ' + (error.message || error));
  }
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

    const camposVacios = Object.keys(this.registroForm.controls).some(control => {
      const formControl = this.registroForm.get(control);
      return formControl ? !formControl.value : true; // Verifica si el valor del control está vacío
    });

    if (camposVacios) {
      this.mostrarToast('Por favor, completa todos los campos obligatorios.');
      return false; // Indica que la validación falló
    }
    if (correoControl && correoControl.invalid && correoControl.touched) {
      this.mostrarToast('El correo está mal escrito, vuelva a intentar');
      return false; // Indica que la validación falló
    }

    return true; // Indica que todas las validaciones pasaron
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
