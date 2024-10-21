import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../../servicios/firestore.service';
import { AuthService } from 'src/app/servicios/auth.service';
import { getAuth, updateEmail, updatePassword } from 'firebase/auth';
@Component({
  selector: 'app-editarperfil',
  templateUrl: './editarperfil.component.html',
  styleUrls: ['./editarperfil.component.scss'],
})
export class EditarperfilComponent  implements OnInit {
  correo: string = '';   // Declaración de las variables
  peso!: number;
  altura!: number ;
  password: string = '';
  password2: string = '';
  result: number=0;
  constructor( private cdr: ChangeDetectorRef, private route: ActivatedRoute, private  navCtrl: NavController, private alertController: AlertController, public toastController:ToastController, private router:Router, private firestoreService:FirestoreService, private authService: AuthService) {
      }
  Atras() {
    // Navegar hacia la página anterior
    this.navCtrl.back();
  }
  irAPaginaDestino() {
    console.log("entra")
    this.router.navigate(['/tabs/configuracion']);
    
  }
  siguiente(){
    if (this.result !== 5){
      console.log('no entra')
      this.router.navigate(['/tabs/editar-perfil'])
    }else{
      console.log('entra 1')
      this.Atras()
    }  
  }
  ngOnInit() {}


  validar( pasword: string, pasword2: string,  weight: number, height: number): number {
    
    console.log('entra2')
    if (!pasword || !pasword2) {
      console.log('Las contraseñas son requeridas');
      this.passwordAlert();
      return 2;
    } else if (pasword != pasword2) {
      console.log('2')
      console.log(pasword, pasword2)
      this.passwordAlert()
      return 2;
    } else if (weight === null || height === null || weight <= 0 || height <= 0) {
      console.log('Peso o altura inválido');
      return 1;
    } else {
      console.log('5')
      return 5;
    }
  }
  validarCorreo(email: string): number{
    console.log(email)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (email.length === 0) {
      console.log('3')
      this.correoAlert()
      return  3;

    } else if (!emailPattern.test(email)) {
      console.log('4')
      this.correo2Alert()
      return 4;
    }else{
      return 5;
    }
  }
  async saveProfile() {
    const userId = this.authService.getCurrentUser(); // Obtener el usuario autenticado
  
    if (userId) {
      const uid = userId.uid; // Ahora es seguro acceder a uid
      const profileData = {
        correo: this.correo,
        peso: this.peso,
        altura: this.altura,
        // Agrega otros campos que necesites actualizar
      };
  
      const auth = getAuth(); // Obtener la instancia de autenticación
      const user = auth.currentUser; // Obtener el usuario autenticado
  
      // Verifica que el usuario no sea nulo
      if (user) {
        try {
          // Actualiza el correo electrónico en Firebase
          await updateEmail(user, this.correo);
  
          // Actualiza la contraseña si se proporciona
          if (this.password) {
            await updatePassword(user, this.password);
          }
  
          // Actualiza el perfil en Firestore
          await this.firestoreService.updateUserProfile(uid, profileData);
  
          // Sincroniza los datos locales
          this.correo = this.correo; // Actualiza la variable local con el nuevo correo
          this.peso = this.peso;     // Asegúrate de que la variable peso esté actualizada
          this.altura = this.altura; // Asegúrate de que la variable altura esté actualizada
  
          console.log('Perfil actualizado correctamente');
          this.correctdAlert(); // Llama a tu alerta de éxito
        } catch (error) {
          console.error('Error actualizando el perfil', error);
          // Maneja el error según sea necesario
        }
      } else {
        console.error('No hay usuario autenticado');
        // Aquí podrías mostrar una alerta o redirigir al usuario a la página de inicio de sesión
      }
    } else {
      console.error('No hay usuario autenticado');
      // Aquí podrías mostrar una alerta o redirigir al usuario a la página de inicio de sesión
    }
  }
  
  async passwordAlert() {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: 'Las contraseñas no son iguales.',
      buttons: ['OK'],
    });
  
    await alert.present();
  }
  async correctdAlert() {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: 'Se han guardado los cambios.',
      buttons: ['OK'],
    });
  
    await alert.present();
  }
  async correoAlert() {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: 'Debe escribir un correo.',
      buttons: ['OK'],
    });
  
    await alert.present();
  }
  
  async correo2Alert() {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: 'El correo no esta bien escrito.',
      buttons: ['OK'],
    });
  
    await alert.present();
  }
  
  todosperfil(event: Event) {
    event.preventDefault();
  
    this.result = this.validarCorreo(this.correo);
    console.log('Resultado de validación de correo:', this.result);
  
    if (this.result === 5) {
      this.result = this.validar(this.password, this.password2, this.peso, this.altura);
      
      if (this.result === 5) {
        this.saveProfile(); // Llama a la función para guardar los datos
      }
    }
  
    this.cdr.detectChanges(); 
    this.siguiente();
  }
}
