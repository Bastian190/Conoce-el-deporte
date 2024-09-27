import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-editarperfil',
  templateUrl: './editarperfil.component.html',
  styleUrls: ['./editarperfil.component.scss'],
})
export class EditarperfilComponent  implements OnInit {
  usuario!: string ;
  apellido!: string;
  password!: string;
  password2!: string;
  correo!: string;
  peso!: number;
  altura!:number;
  result!: number;
  constructor( private route: ActivatedRoute, private  navCtrl: NavController, private alertController: AlertController, public toastController:ToastController, private router:Router) { }

  Atras() {
    // Navegar hacia la página anterior
    this.navCtrl.back();
  }
  irAPaginaDestino() {
    console.log("entra")
    this.router.navigate(['/tabs/configuracion']);
    
  }
  siguiente(){
    if(this.result==1 || this.result==2 || this.result==3){
      this.router.navigate(['/tabs/editar-perfil'])
    }else if(this.result==4){
      this.Atras()
    }  
  }
  ngOnInit() {}
  validar(user: string, apellido: string, password: string, password2: string, email: string, peso: number, altura: number) {
    const emailPattern = /^([\da-z_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
  
    if (!user) {
      console.log('1');
      this.presentAlert();
      return this.result = 1;
    } else if (!apellido) {
      console.log('Apellido requerido');
      this.presentAlert();
      return this.result = 1;
    } else if (!password) {
      console.log('2');
      this.presentAlert();
      return this.result = 2;
    } else if (password !== password2) {
      console.log('3');
      this.passwordAlert();
      return this.result = 3;
    } else if (email.length === 0) {
      this.correoAlert();
      return this.result = 3;
    } else if (!emailPattern.test(email)) {
      this.correo2Alert();
      return this.result = 3;
    } else if (peso <= 0 || altura <= 0) {
      console.log('Peso o altura inválido');
      return this.result = 1;
    } else {
      console.log('4');
      return this.result = 4;
    }
  }

  
  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: 'El usuario o contraseña no es correcto.',
      buttons: ['OK'],
    });
  
    await alert.present();
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
  
  todos() {
    this.validar(this.usuario, this.apellido, this.password, this.password2, this.correo, this.peso, this.altura);
    this.siguiente();
  }
}
